// src/contexts/CurrencyContext.js
//
// App-wide currency detection based on the visitor's location.
//
// Different parts of SolidFlo author amounts in different currencies:
//   - business invoices / quotes / dashboard totals are entered in ZAR
//     (the local business's own currency)
//   - the SolidFlo subscription pricing plans are authored in USD
// This context detects the *visitor's* local currency (via IP
// geolocation) and lets any component convert a "known" amount from
// whatever currency it's authored in into the visitor's local currency
// for display.
//
// IMPORTANT: this only changes how numbers are *displayed*. It never
// changes what is stored in the database. For anything that represents
// a fixed legal/financial obligation already issued in ZAR — an actual
// invoice, quote or receipt total that a client owes — prefer
// formatBaseCurrency() (always shows the real issued currency) so a
// document doesn't appear to change amount depending on who later views
// it. Use formatCurrency() for informational displays (dashboard stats,
// the public pricing page, previews) where showing the visitor's local
// equivalent is genuinely helpful.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const DEFAULT_CURRENCY = "ZAR"; // what most business records are entered in
const RATE_PIVOT = "USD"; // currency the exchange-rate API is queried against
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
    const rates = { ...(data.rates || {}), [RATE_PIVOT]: 1 };
    writeCache(RATES_CACHE_KEY, rates);
    return rates;
  } catch {
    return { [RATE_PIVOT]: 1 };
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

      setCurrencyCode(geo.currencyCode || DEFAULT_CURRENCY);
      setCountryName(geo.countryName);
      setCountryCode(geo.countryCode);
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

  // Converts + formats `amount` (denominated in `fromCurrency`, default
  // ZAR) into the visitor's local currency, e.g. formatCurrency(220) on a
  // US visitor might render "$12".
  const formatCurrency = useCallback(
    (amount, fromCurrency = DEFAULT_CURRENCY, { fractionDigits } = {}) => {
      const converted = convert(amount, fromCurrency);
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currencyCode,
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
      formatCurrency,
      formatBaseCurrency,
    }),
    [currencyCode, countryName, countryCode, rates, loading, ready, convert, formatCurrency, formatBaseCurrency]
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
