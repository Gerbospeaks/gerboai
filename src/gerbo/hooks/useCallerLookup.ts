import { useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CallerClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phoneNormalised?: string;
  address?: string;
  notes?: string;
  createdAt?: any;
  source?: 'gerboai_call' | 'solidflo' | string;
  [key: string]: any;
}

export interface NewClientInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  /** Any extra context the AI collected during the call */
  notes?: string;
}

export interface CallerInvoice {
  id: string;
  invoiceNumber?: string;
  status?: string;
  total?: number;
  dueDate?: any;
  createdAt?: any;
  items?: any[];
  [key: string]: any;
}

export interface CallerQuotation {
  id: string;
  quotationNumber?: string;
  status?: string;
  total?: number;
  createdAt?: any;
  items?: any[];
  [key: string]: any;
}

export interface CallerPayment {
  id: string;
  amount?: number;
  date?: any;
  method?: string;
  invoiceId?: string;
  [key: string]: any;
}

export interface CallerPurchaseOrder {
  id: string;
  poNumber?: string;
  status?: string;
  total?: number;
  createdAt?: any;
  [key: string]: any;
}

export interface CallerProfile {
  ownerUid: string;
  isNewClient: boolean;         // true when just created during this call
  client: CallerClient;
  invoices: CallerInvoice[];
  quotations: CallerQuotation[];
  payments: CallerPayment[];
  purchaseOrders: CallerPurchaseOrder[];
  outstandingBalance: number;
  summary: string;              // plain-English — feed directly to your AI prompt
}

export interface UseCallerLookupReturn {
  profile: CallerProfile | null;
  loading: boolean;
  error: string | null;
  /**
   * PRIMARY METHOD — call this on every inbound call.
   * Tries phone → name → email in order.
   * If no match is found, creates a new client automatically and returns
   * their fresh (empty) profile with isNewClient = true.
   */
  lookupOrCreate: (input: NewClientInput, ownerUid: string) => Promise<CallerProfile>;
  /**
   * Explicitly create a brand-new client and return their profile.
   * Use when you've already confirmed they are not in the system.
   */
  createCaller: (input: NewClientInput, ownerUid: string) => Promise<CallerProfile>;
  /** Find existing client by phone */
  lookupByPhone: (phone: string, ownerUid: string) => Promise<CallerProfile | null>;
  /** Find existing client by name */
  lookupByName: (name: string, ownerUid: string) => Promise<CallerProfile | null>;
  /** Find existing client by email */
  lookupByEmail: (email: string, ownerUid: string) => Promise<CallerProfile | null>;
  clear: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalisePhone = (phone: string) => phone.replace(/\D/g, '');

const formatDate = (ts: any): string => {
  if (!ts) return 'unknown date';
  if (ts?.toDate) return ts.toDate().toLocaleDateString('en-ZA');
  return new Date(ts).toLocaleDateString('en-ZA');
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount ?? 0);

const isReal = (data: any) => !data._placeholder;

// ─── Fetch all subcollections for a known clientId ────────────────────────────

const fetchClientSubcollections = async (
  ownerUid: string,
  clientId: string,
): Promise<Omit<CallerProfile, 'ownerUid' | 'client' | 'summary' | 'isNewClient'>> => {
  const [invoicesSnap, quotationsSnap, paymentsSnap, poSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, 'users', ownerUid, 'invoices'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc'),
        limit(50),
      ),
    ),
    getDocs(
      query(
        collection(db, 'users', ownerUid, 'quotations'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc'),
        limit(50),
      ),
    ),
    getDocs(
      query(
        collection(db, 'users', ownerUid, 'payments'),
        where('clientId', '==', clientId),
        orderBy('date', 'desc'),
        limit(50),
      ),
    ),
    getDocs(
      query(
        collection(db, 'users', ownerUid, 'purchaseOrders'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc'),
        limit(50),
      ),
    ),
  ]);

  const invoices       = invoicesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CallerInvoice)).filter(isReal);
  const quotations     = quotationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CallerQuotation)).filter(isReal);
  const payments       = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CallerPayment)).filter(isReal);
  const purchaseOrders = poSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CallerPurchaseOrder)).filter(isReal);

  const outstandingBalance = invoices
    .filter((inv) => !['paid', 'cancelled'].includes((inv.status ?? '').toLowerCase()))
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0);

  return { invoices, quotations, payments, purchaseOrders, outstandingBalance };
};

// ─── Plain-English summary for the AI to read ────────────────────────────────

const buildSummary = (
  client: CallerClient,
  isNewClient: boolean,
  data: Omit<CallerProfile, 'ownerUid' | 'client' | 'summary' | 'isNewClient'>,
): string => {
  if (isNewClient) {
    return (
      `${client.name} is a new client — no previous history on file. ` +
      `Their details have been saved. You can now create a quotation or invoice for them.`
    );
  }

  const { invoices, quotations, payments, purchaseOrders, outstandingBalance } = data;
  const lines: string[] = [`Client: ${client.name}.`];

  const unpaidInvoices = invoices.filter(
    (inv) => !['paid', 'cancelled'].includes((inv.status ?? '').toLowerCase()),
  );

  if (invoices.length === 0) {
    lines.push('No invoices on record.');
  } else {
    lines.push(`${invoices.length} invoice(s) total.`);
    if (unpaidInvoices.length > 0) {
      lines.push(
        `${unpaidInvoices.length} unpaid invoice(s) totalling ${formatCurrency(outstandingBalance)}.`,
      );
      unpaidInvoices.slice(0, 3).forEach((inv) =>
        lines.push(
          `Invoice ${inv.invoiceNumber ?? inv.id}: ${formatCurrency(inv.total ?? 0)}, ` +
          `due ${formatDate(inv.dueDate)}, status: ${inv.status ?? 'unknown'}.`,
        ),
      );
    } else {
      lines.push('All invoices are paid.');
    }
  }

  if (quotations.length > 0) {
    const pending = quotations.filter((q) =>
      ['draft', 'sent', 'pending'].includes((q.status ?? '').toLowerCase()),
    );
    lines.push(`${quotations.length} quotation(s) on file.`);
    if (pending.length > 0) {
      lines.push(`${pending.length} pending quotation(s):`);
      pending.slice(0, 3).forEach((q) =>
        lines.push(
          `Quote ${q.quotationNumber ?? q.id}: ${formatCurrency(q.total ?? 0)}, ` +
          `created ${formatDate(q.createdAt)}.`,
        ),
      );
    }
  } else {
    lines.push('No quotations on file.');
  }

  if (payments.length > 0) {
    const last = payments[0];
    lines.push(
      `Last payment: ${formatCurrency(last.amount ?? 0)} on ${formatDate(last.date)} ` +
      `via ${last.method ?? 'unknown method'}.`,
    );
  }

  if (purchaseOrders.length > 0) {
    lines.push(`${purchaseOrders.length} purchase order(s) on file.`);
  }

  return lines.join(' ');
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCallerLookup = (): UseCallerLookupReturn => {
  const [profile, setProfile] = useState<CallerProfile | null>(null);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState<string | null>(null);

  // ── Internal: build CallerProfile from a query snapshot ─────────────────
  const resolveProfile = useCallback(
    async (
      clientSnap: any,
      ownerUid: string,
      isNewClient = false,
    ): Promise<CallerProfile | null> => {
      const isEmpty = clientSnap?.empty ?? !clientSnap?.exists?.();
      if (isEmpty) return null;

      const clientDoc  = clientSnap.docs ? clientSnap.docs[0] : clientSnap;
      const clientData = clientDoc.data();
      if (!clientData || clientData._placeholder) return null;

      const client: CallerClient = { id: clientDoc.id, ...clientData };
      const subData  = await fetchClientSubcollections(ownerUid, client.id);
      const summary  = buildSummary(client, isNewClient, subData);
      const result: CallerProfile = { ownerUid, isNewClient, client, ...subData, summary };
      setProfile(result);
      return result;
    },
    [],
  );

  // ── createCaller ─────────────────────────────────────────────────────────
  const createCaller = useCallback(
    async (input: NewClientInput, ownerUid: string): Promise<CallerProfile> => {
      setLoading(true);
      setError(null);
      try {
        const phone           = input.phone?.trim() ?? '';
        const phoneNormalised = normalisePhone(phone);

        // addDoc lets Firestore generate the ID — same pattern GerboAI uses
        const clientRef = await addDoc(
          collection(db, 'users', ownerUid, 'clients'),
          {
            name:             input.name.trim(),
            email:            input.email?.toLowerCase().trim() ?? '',
            phone,
            phoneNormalised,
            address:          input.address?.trim() ?? '',
            notes:            input.notes?.trim() ?? '',
            source:           'gerboai_call',   // tag so it shows in GerboAI dashboard
            createdAt:        serverTimestamp(),
            updatedAt:        serverTimestamp(),
          },
        );

        const client: CallerClient = {
          id:               clientRef.id,
          name:             input.name.trim(),
          email:            input.email ?? '',
          phone,
          phoneNormalised,
          address:          input.address ?? '',
          notes:            input.notes ?? '',
          source:           'gerboai_call',
        };

        const emptySubData = {
          invoices:           [] as CallerInvoice[],
          quotations:         [] as CallerQuotation[],
          payments:           [] as CallerPayment[],
          purchaseOrders:     [] as CallerPurchaseOrder[],
          outstandingBalance: 0,
        };

        const summary = buildSummary(client, true, emptySubData);
        const result: CallerProfile = { ownerUid, isNewClient: true, client, ...emptySubData, summary };
        setProfile(result);
        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ── lookupOrCreate ────────────────────────────────────────────────────────
  const lookupOrCreate = useCallback(
    async (input: NewClientInput, ownerUid: string): Promise<CallerProfile> => {
      setLoading(true);
      setError(null);
      try {
        // 1. Phone — try raw then normalised
        if (input.phone) {
          const phone      = input.phone.trim();
          const normalised = normalisePhone(phone);

          const byPhone = await getDocs(
            query(collection(db, 'users', ownerUid, 'clients'), where('phone', '==', phone), limit(1)),
          );
          if (!byPhone.empty) return (await resolveProfile(byPhone, ownerUid))!;

          const byNorm = await getDocs(
            query(collection(db, 'users', ownerUid, 'clients'), where('phoneNormalised', '==', normalised), limit(1)),
          );
          if (!byNorm.empty) return (await resolveProfile(byNorm, ownerUid))!;
        }

        // 2. Name prefix
        if (input.name) {
          const n   = input.name.trim();
          const end = n.slice(0, -1) + String.fromCharCode(n.charCodeAt(n.length - 1) + 1);
          const byName = await getDocs(
            query(
              collection(db, 'users', ownerUid, 'clients'),
              where('name', '>=', n),
              where('name', '<',  end),
              limit(1),
            ),
          );
          if (!byName.empty) return (await resolveProfile(byName, ownerUid))!;
        }

        // 3. Email
        if (input.email) {
          const byEmail = await getDocs(
            query(
              collection(db, 'users', ownerUid, 'clients'),
              where('email', '==', input.email.toLowerCase().trim()),
              limit(1),
            ),
          );
          if (!byEmail.empty) return (await resolveProfile(byEmail, ownerUid))!;
        }

        // 4. No match — create new client
        return await createCaller(input, ownerUid);
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resolveProfile, createCaller],
  );

  // ── Standalone lookups ────────────────────────────────────────────────────
  const lookupByPhone = useCallback(
    async (phone: string, ownerUid: string): Promise<CallerProfile | null> => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(
          query(collection(db, 'users', ownerUid, 'clients'), where('phone', '==', phone), limit(1)),
        );
        if (!snap.empty) return resolveProfile(snap, ownerUid);
        const norm = await getDocs(
          query(collection(db, 'users', ownerUid, 'clients'), where('phoneNormalised', '==', normalisePhone(phone)), limit(1)),
        );
        return resolveProfile(norm, ownerUid);
      } catch (err: any) { setError(err.message); return null; }
      finally { setLoading(false); }
    },
    [resolveProfile],
  );

  const lookupByName = useCallback(
    async (name: string, ownerUid: string): Promise<CallerProfile | null> => {
      setLoading(true);
      setError(null);
      try {
        const end  = name.slice(0, -1) + String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
        const snap = await getDocs(
          query(collection(db, 'users', ownerUid, 'clients'), where('name', '>=', name), where('name', '<', end), limit(5)),
        );
        return resolveProfile(snap, ownerUid);
      } catch (err: any) { setError(err.message); return null; }
      finally { setLoading(false); }
    },
    [resolveProfile],
  );

  const lookupByEmail = useCallback(
    async (email: string, ownerUid: string): Promise<CallerProfile | null> => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(
          query(collection(db, 'users', ownerUid, 'clients'), where('email', '==', email.toLowerCase().trim()), limit(1)),
        );
        return resolveProfile(snap, ownerUid);
      } catch (err: any) { setError(err.message); return null; }
      finally { setLoading(false); }
    },
    [resolveProfile],
  );

  const clear = useCallback(() => { setProfile(null); setError(null); }, []);

  return {
    profile,
    loading,
    error,
    lookupOrCreate,
    createCaller,
    lookupByPhone,
    lookupByName,
    lookupByEmail,
    clear,
  };
};