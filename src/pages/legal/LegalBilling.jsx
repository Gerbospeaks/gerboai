import React, { useState, useEffect } from "react";
import {
  getFirestore, collection, query, orderBy,
  getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import {
  Receipt, Plus, X, Edit2, Trash2, Search, Clock,
  DollarSign, CheckSquare, Wallet, TrendingUp, Filter,
  FileText, Users, ChevronDown, Download,
} from "lucide-react";

const BILLING_TYPES = ["Time","Disbursement","Fixed Fee","Consultation","Appearance","Research","Drafting","Other"];
const RATES = { "Partner":3500, "Senior Associate":2800, "Associate":2200, "Candidate Attorney":1200, "Custom":0 };
const STATUS_CFG = {
  unbilled:  { label:"Unbilled",  bg:"bg-[#fef3c7]", text:"text-[#92400e]" },
  billed:    { label:"Billed",    bg:"bg-[#dbeafe]",  text:"text-[#1e40af]" },
  paid:      { label:"Paid",      bg:"bg-[#dcfce7]",  text:"text-[#166534]" },
  written_off:{ label:"Written Off",bg:"bg-[#f1f5f9]",text:"text-[#374151]" },
};
const DISBURSEMENT_TYPES = [
  "Filing Fees","Sheriff Fees","Advocate Fees","Expert Witness","Travel","Postage","Copying",
  "Court Transcripts","Search Fees","Commissioner of Oaths","Other",
];

const EMPTY_TIME = {
  type:"Time", date:"", clientName:"", caseNumber:"", description:"",
  billerRole:"Associate", rate:2200, hours:"", amount:0,
  disbursementType:"", status:"unbilled", notes:"",
};
const inp = "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";

export default function LegalBilling({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_TIME);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("entries");
  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db,"users",user.uid,"billingEntries"), orderBy("date","desc")));
      setEntries(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch(_) {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const openAdd = (isDisb=false) => {
    setEditing(null);
    setForm({...EMPTY_TIME, date:new Date().toISOString().split("T")[0], type:isDisb?"Disbursement":"Time"});
    setShowModal(true);
  };
  const openEdit = (e) => { setEditing(e.id); setForm({...EMPTY_TIME,...e}); setShowModal(true); };
  const set = (k,v) => setForm(p => {
    const updated = {...p,[k]:v};
    if (k==="billerRole" && v!=="Custom") updated.rate = RATES[v];
    if (k==="hours" || k==="rate") updated.amount = (parseFloat(updated.hours)||0)*(parseFloat(updated.rate)||0);
    return updated;
  });

  const handleSave = async () => {
    if (!form.date || !form.description || !form.clientName) return;
    setSaving(true);
    try {
      const payload = { ...form, amount:parseFloat(form.amount)||0, updatedAt:serverTimestamp() };
      if (editing) await updateDoc(doc(db,"users",user.uid,"billingEntries",editing), payload);
      else await addDoc(collection(db,"users",user.uid,"billingEntries"), {...payload, createdAt:serverTimestamp()});
      setShowModal(false); load();
    } catch(_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this billing entry?")) return;
    await deleteDoc(doc(db,"users",user.uid,"billingEntries",id)); load();
  };

  const handleMarkStatus = async (id, status) => {
    await updateDoc(doc(db,"users",user.uid,"billingEntries",id), { status, updatedAt:serverTimestamp() });
    load();
  };

  const filtered = entries.filter(e => {
    const s = search.toLowerCase();
    const matchSearch = !search ||
      e.clientName?.toLowerCase().includes(s) || e.caseNumber?.toLowerCase().includes(s) ||
      e.description?.toLowerCase().includes(s);
    const matchStatus = filterStatus==="all" || e.status===filterStatus;
    const matchType = filterType==="all" ||
      (filterType==="time" && e.type!=="Disbursement") ||
      (filterType==="disbursement" && e.type==="Disbursement");
    return matchSearch && matchStatus && matchType;
  });

  const fmt = (n) => new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(n||0);

  const totalUnbilled = entries.filter(e=>e.status==="unbilled").reduce((s,e)=>s+parseFloat(e.amount||0),0);
  const totalBilled   = entries.filter(e=>e.status==="billed").reduce((s,e)=>s+parseFloat(e.amount||0),0);
  const totalPaid     = entries.filter(e=>e.status==="paid").reduce((s,e)=>s+parseFloat(e.amount||0),0);
  const totalHours    = entries.filter(e=>e.type!=="Disbursement").reduce((s,e)=>s+parseFloat(e.hours||0),0);

  // Group by client for summary
  const clientSummary = entries.reduce((acc, e) => {
    const k = e.clientName || "Unknown";
    if (!acc[k]) acc[k] = { unbilled:0, billed:0, paid:0, hours:0 };
    acc[k][e.status] = (acc[k][e.status]||0) + parseFloat(e.amount||0);
    if (e.type!=="Disbursement") acc[k].hours += parseFloat(e.hours||0);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#ea580c]"/>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1e293b]">Billing</h1>
              <p className="text-xs text-[#64748b]">Time entries and disbursements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>openAdd(true)}
              className="flex items-center gap-2 px-3 py-2 bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-[#059669] text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4"/> Disbursement
            </button>
            <button onClick={()=>openAdd(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors">
              <Clock className="w-4 h-4"/> Log Time
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:"Unbilled",    value:fmt(totalUnbilled), icon:Wallet,      bg:"bg-[#fef3c7]", iconBg:"bg-[#fde68a]", text:"text-[#92400e]", border:"border-[#fde68a]" },
            { label:"Billed",      value:fmt(totalBilled),   icon:Receipt,     bg:"bg-[#dbeafe]",  iconBg:"bg-[#bfdbfe]", text:"text-[#1e40af]", border:"border-[#bfdbfe]" },
            { label:"Collected",   value:fmt(totalPaid),     icon:CheckSquare, bg:"bg-[#dcfce7]",  iconBg:"bg-[#bbf7d0]", text:"text-[#166534]", border:"border-[#bbf7d0]" },
            { label:"Total Hours", value:`${totalHours.toFixed(1)} hrs`, icon:Clock, bg:"bg-[#ede9fe]", iconBg:"bg-[#ddd6fe]", text:"text-[#5b21b6]", border:"border-[#c4b5fd]" },
          ].map(({label,value,icon:Icon,bg,iconBg,text,border}) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-3 flex items-center gap-3`}>
              <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${text}`}/>
              </div>
              <div>
                <p className="text-xs text-[#64748b]">{label}</p>
                <p className={`text-sm font-bold ${text}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-lg w-fit">
          {[{key:"entries",label:"Entries"},{key:"summary",label:"By Client"}].map(({key,label}) => (
            <button key={key} onClick={()=>setActiveTab(key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab===key?"bg-white text-[#1e293b] shadow-sm":"text-[#64748b] hover:text-[#374151]"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab==="entries" && (
          <>
            {/* Filters */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search client, case, description…"
                  className="flex-1 text-sm bg-transparent outline-none text-[#1e293b] placeholder-[#94a3b8]"/>
              </div>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] outline-none">
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)}
                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] outline-none">
                <option value="all">All Types</option>
                <option value="time">Time Entries</option>
                <option value="disbursement">Disbursements</option>
              </select>
            </div>

            {/* Entries table */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"/>
                </div>
              ) : filtered.length===0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-[#94a3b8]"/>
                  </div>
                  <p className="text-sm font-semibold text-[#374151] mb-1">No billing entries found</p>
                  <p className="text-xs text-[#94a3b8] mb-4">Start tracking your time and disbursements</p>
                  <button onClick={()=>openAdd(false)}
                    className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors">
                    Log Time
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          {["Date","Client / Case","Description","Type","Hours","Rate","Amount","Status",""].map(h=>(
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(e => {
                          const st = STATUS_CFG[e.status] || STATUS_CFG.unbilled;
                          return (
                            <tr key={e.id} className="border-b border-[#f1f5f9] hover:bg-[#fafafa] transition-colors">
                              <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                                {e.date ? new Date(e.date+"T00:00:00").toLocaleDateString("en-ZA") : "—"}
                              </td>
                              <td className="px-4 py-3 min-w-[140px]">
                                <p className="text-xs font-semibold text-[#374151] truncate max-w-[140px]">{e.clientName||"—"}</p>
                                {e.caseNumber && <p className="text-xs text-[#94a3b8]">{e.caseNumber}</p>}
                              </td>
                              <td className="px-4 py-3 min-w-[180px]">
                                <p className="text-xs text-[#374151] line-clamp-2 max-w-[200px]">{e.description}</p>
                                {e.type==="Disbursement" && e.disbursementType && (
                                  <p className="text-xs text-[#94a3b8]">{e.disbursementType}</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.type==="Disbursement"?"bg-[#f0fdfa] text-[#0e7490]":"bg-[#ede9fe] text-[#5b21b6]"}`}>
                                  {e.type==="Disbursement"?"Disb.":e.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-[#374151] whitespace-nowrap">
                                {e.type==="Disbursement"?"—":`${parseFloat(e.hours||0).toFixed(1)}h`}
                              </td>
                              <td className="px-4 py-3 text-xs text-[#374151] whitespace-nowrap">
                                {e.type==="Disbursement"?"—":fmt(e.rate)+"/hr"}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-[#1e293b] whitespace-nowrap">
                                {fmt(e.amount)}
                              </td>
                              <td className="px-4 py-3">
                                <select value={e.status}
                                  onChange={ev=>handleMarkStatus(e.id,ev.target.value)}
                                  className={`text-xs font-medium px-2 py-0.5 rounded border-0 outline-none cursor-pointer ${st.bg} ${st.text}`}>
                                  {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <button onClick={()=>openEdit(e)} className="p-1 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#ede9fe] rounded transition-all">
                                    <Edit2 className="w-3 h-3"/>
                                  </button>
                                  <button onClick={()=>handleDelete(e.id)} className="p-1 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded transition-all">
                                    <Trash2 className="w-3 h-3"/>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0]">
                          <td colSpan={6} className="px-4 py-3 text-xs font-bold text-[#374151] text-right">Total Shown:</td>
                          <td className="px-4 py-3 text-sm font-black text-[#7c3aed]">
                            {fmt(filtered.reduce((s,e)=>s+parseFloat(e.amount||0),0))}
                          </td>
                          <td colSpan={2}/>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {activeTab==="summary" && (
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            {Object.keys(clientSummary).length===0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="w-10 h-10 text-[#cbd5e1] mb-3"/>
                <p className="text-sm text-[#94a3b8]">No billing data yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    {["Client","Hours","Unbilled","Billed","Paid","Total"].map(h=>(
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(clientSummary).sort((a,b)=>
                    (b[1].unbilled+b[1].billed+b[1].paid)-(a[1].unbilled+a[1].billed+a[1].paid)
                  ).map(([client,data]) => (
                    <tr key={client} className="border-b border-[#f1f5f9] hover:bg-[#fafafa]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#ede9fe] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#7c3aed]">{client.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-semibold text-[#374151]">{client}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#374151]">{data.hours.toFixed(1)}h</td>
                      <td className="px-5 py-3 text-sm font-medium text-[#92400e]">{fmt(data.unbilled)}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[#1e40af]">{fmt(data.billed)}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[#166534]">{fmt(data.paid)}</td>
                      <td className="px-5 py-3 text-sm font-bold text-[#1e293b]">{fmt(data.unbilled+data.billed+data.paid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div className="flex items-center gap-2">
                {form.type==="Disbursement" ? <Receipt className="w-5 h-5 text-[#059669]"/> : <Clock className="w-5 h-5 text-[#7c3aed]"/>}
                <h2 className="text-base font-semibold text-[#1e293b]">
                  {editing ? "Edit Entry" : form.type==="Disbursement" ? "Add Disbursement" : "Log Time"}
                </h2>
              </div>
              <button onClick={()=>setShowModal(false)} className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Entry Type">
                  <select value={form.type} onChange={e=>set("type",e.target.value)} className={inp}>
                    {BILLING_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </Fld>
                <Fld label="Date" req>
                  <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} className={inp}/>
                </Fld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Client Name" req>
                  <input value={form.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="Client name" className={inp}/>
                </Fld>
                <Fld label="Case Number">
                  <input value={form.caseNumber} onChange={e=>set("caseNumber",e.target.value)} placeholder="e.g. CASE-2026-001" className={inp}/>
                </Fld>
              </div>
              <Fld label="Description" req>
                <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={2}
                  placeholder={form.type==="Disbursement"?"e.g. Filing fee for application at High Court":"e.g. Drafting of founding affidavit and heads of argument"}
                  className={`${inp} resize-none`}/>
              </Fld>

              {form.type==="Disbursement" ? (
                <>
                  <Fld label="Disbursement Category">
                    <select value={form.disbursementType} onChange={e=>set("disbursementType",e.target.value)} className={inp}>
                      <option value="">Select category…</option>
                      {DISBURSEMENT_TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Amount (ZAR)" req>
                    <input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)}
                      placeholder="0.00" min="0" step="0.01" className={inp}/>
                  </Fld>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Fld label="Biller Role">
                      <select value={form.billerRole} onChange={e=>set("billerRole",e.target.value)} className={inp}>
                        {Object.keys(RATES).map(r=><option key={r}>{r}</option>)}
                      </select>
                    </Fld>
                    <Fld label="Rate (ZAR/hr)">
                      <input type="number" value={form.rate} onChange={e=>set("rate",e.target.value)}
                        placeholder="0.00" min="0" step="50" className={inp}/>
                    </Fld>
                    <Fld label="Hours">
                      <input type="number" value={form.hours} onChange={e=>set("hours",e.target.value)}
                        placeholder="0.5" min="0" step="0.1" className={inp}/>
                    </Fld>
                  </div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-[#64748b]">Calculated Amount</span>
                    <span className="text-lg font-bold text-[#7c3aed]">
                      {new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(
                        (parseFloat(form.rate)||0)*(parseFloat(form.hours)||0)
                      )}
                    </span>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Fld label="Status">
                  <select value={form.status} onChange={e=>set("status",e.target.value)} className={inp}>
                    {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </Fld>
              </div>
              <Fld label="Internal Notes">
                <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2}
                  placeholder="Internal notes (not shown on invoice)…" className={`${inp} resize-none`}/>
              </Fld>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#e2e8f0] rounded-lg transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving||!form.date||!form.description||!form.clientName}
                className="px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                {editing?"Update":"Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Fld({label,children,req}){return(<div><label className="block text-xs font-semibold text-[#374151] mb-1.5">{label}{req&&<span className="text-[#dc2626] ml-0.5">*</span>}</label>{children}</div>);}