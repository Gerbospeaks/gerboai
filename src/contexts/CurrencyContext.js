

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
const DEFAULT_CURRENCY = "ZAR"; 
const USD_OVERRIDE = new Set(["ZWG", "ZWL"]);
const normalizeCurrency = (code) =>
  USD_OVERRIDE.has(String(code || "").toUpperCase()) ? "USD" : code;
const RATE_PIVOT = "USD"; 
const GEO_CACHE_KEY = "sf_geo_currency_v1";
const RATES_CACHE_KEY = "sf_exchange_rates_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
};


const SUPPORTED_CURRENCIES = new Set([
  "USD", "EUR", "GBP", "ZAR", "AUD", "CAD", "NZD", "CHF",
  "KES", "NGN", "GHS", "BWP", "ZMW", "INR", "AED",
]);

// Approximate USD-pivot rates, used only if the live rate API fails.
// Adjust these to current values.
const FALLBACK_RATES = {
  USD: 1, ZAR: 18.5, EUR: 0.92, GBP: 0.79, AUD: 1.5, CAD: 1.37,
  NZD: 1.65, CHF: 0.88, KES: 129, NGN: 1500, GHS: 15, BWP: 13.6,
  ZMW: 26, INR: 83, AED: 3.67,
};

export const resolveCurrency = (code) => {
  const c = String(code || "").toUpperCase();
  return SUPPORTED_CURRENCIES.has(c) ? c : "USD";
};

export const formatMoney = (amount, code, digits = 2) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number(amount) || 0);
  } catch {
    return `${code} ${(Number(amount) || 0).toFixed(digits)}`;
  }
};

// Module-level copy of the live rates so convert() can be a plain function.
// The provider updates it; components re-render because they use useCurrency().
let liveRates = { ...FALLBACK_RATES };

export const convert = (amount, from = "ZAR", to = "USD") => {
  const value = Number(amount) || 0;
  if (from === to) return value;
  const f = liveRates[from];
  const t = liveRates[to];
  if (!f || !t) return value;
  return value * (t / f);
};
const writeCache = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — safe to ignore
  }
};

const fetchGeoInfo = async () => {
  const cached = readCache(GEO_CACHE_KEY);
  if (cached) return cached;

  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("geo lookup failed");
    const data = await res.json();
    const info = {
      currencyCode: data.currency || DEFAULT_CURRENCY,
      countryName: data.country_name || "Unknown",
      countryCode: data.country_code || "",
    };
    writeCache(GEO_CACHE_KEY, info);
    return info;
  } catch {
    return { currencyCode: DEFAULT_CURRENCY, countryName: "Unknown", countryCode: "" };
  }
};

// Rates are all relative to RATE_PIVOT (USD), e.g. { ZAR: 18.5, GBP: 0.79, USD: 1 }.
// Any amount can be converted from currency A to currency B via
// amount * (rates[B] / rates[A]).
const fetchExchangeRates = async () => {
  const cached = readCache(RATES_CACHE_KEY);
  if (cached) return cached;

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${RATE_PIVOT}`);
    if (!res.ok) throw new Error("rate lookup failed");
    const data = await res.json();
    const rates = { ...FALLBACK_RATES, ...(data.rates || {}), [RATE_PIVOT]: 1 };
    writeCache(RATES_CACHE_KEY, rates);
    return rates;
  } catch {
    return { ...FALLBACK_RATES };
  }
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY);
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [rates, setRates] = useState({ [RATE_PIVOT]: 1 });
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [geo, rateTable] = await Promise.all([fetchGeoInfo(), fetchExchangeRates()]);
      if (cancelled) return;

      setCurrencyCode(normalizeCurrency(geo.currencyCode) || DEFAULT_CURRENCY);
      setCountryName(geo.countryName);
      setCountryCode(geo.countryCode);
      liveRates = rateTable;
      setRates(rateTable);
      setLoading(false);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Converts `amount` (denominated in `fromCurrency`) into the visitor's
  // detected local currency.
  const convert = useCallback(
    (amount, fromCurrency = DEFAULT_CURRENCY) => {
      const value = Number(amount) || 0;
    
      const fromRate = rates[fromCurrency];
      const toRate = rates[currencyCode];
      if (!fromRate || !toRate) return value; // rates unavailable — no-op
      return value * (toRate / fromRate);
    },
    [rates, currencyCode]
  );
const convertTo = useCallback(
  (amount, from = DEFAULT_CURRENCY, to = currencyCode) => {
    const value = Number(amount) || 0;
    if (from === to) return value;
    const fromRate = rates[from];
    const toRate = rates[to];
    if (!fromRate || !toRate) return null;
    return value * (toRate / fromRate);
  },
  [rates, currencyCode]
);

  const formatCurrency = useCallback(
    (amount, fromCurrency = DEFAULT_CURRENCY, { fractionDigits } = {}) => {
      const converted = convert(amount, fromCurrency);
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currencyCode,
          currencyDisplay: "narrowSymbol",
          minimumFractionDigits: fractionDigits ?? 2,
          maximumFractionDigits: fractionDigits ?? 2,
        }).format(converted);
      } catch {
        // Unknown/unsupported currency code from the geo API — fall back
        return `${currencyCode} ${converted.toFixed(fractionDigits ?? 2)}`;
      }
    },
    [convert, currencyCode]
  );

  // Formats `amount` in its own real currency (no conversion). Use this
  // for actual invoice/quote/receipt totals that must not change
  // depending on who's viewing them.
  const formatBaseCurrency = useCallback((amount, currency = DEFAULT_CURRENCY, { fractionDigits } = {}) => {
    const value = Number(amount) || 0;
    try {
      return new Intl.NumberFormat(currency === "ZAR" ? "en-ZA" : undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: fractionDigits ?? 2,
        maximumFractionDigits: fractionDigits ?? 2,
      }).format(value);
    } catch {
      return `${currency} ${value.toFixed(fractionDigits ?? 2)}`;
    }
  }, []);

  const value = useMemo(
    () => ({
      defaultCurrency: DEFAULT_CURRENCY,
      currencyCode, // visitor's detected currency
      countryName,
      countryCode,
      rates,
      loading,
      ready,
      convert,
      convertTo,
      formatCurrency,
      formatBaseCurrency,
    }),
    [currencyCode, countryName, countryCode, rates, loading, ready, convert, convertTo, formatCurrency, formatBaseCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}

export default CurrencyContext;
