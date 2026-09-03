import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type CurrencyCode = "USD" | "CAD" | "EUR" | "GBP" | "AUD";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  // Approximate FX rate from 1 USD -> currency. Display-only.
  rate: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  CAD: { code: "CAD", symbol: "$", label: "CAD — Canadian Dollar", rate: 1 },
  USD: { code: "USD", symbol: "US$", label: "USD — US Dollar", rate: 0.7246 },
  EUR: { code: "EUR", symbol: "€", label: "EUR — Euro", rate: 0.6667 },
  GBP: { code: "GBP", symbol: "£", label: "GBP — British Pound", rate: 0.5725 },
  AUD: { code: "AUD", symbol: "A$", label: "AUD — Australian Dollar", rate: 1.1014 },
};

interface CurrencyContextValue {
  currency: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
  /** Convert a CAD amount to the selected currency, formatted with symbol. */
  format: (cadAmount: number, opts?: { decimals?: number }) => string;
  /** Convert a CAD price string like "$800" or "$1,200" into the selected currency. */
  convertPriceString: (cadString: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const STORAGE_KEY = "vortura.currency";

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [code, setCode] = useState<CurrencyCode>("CAD");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved && CURRENCIES[saved]) setCode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setCurrency = (next: CurrencyCode) => {
    setCode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const currency = CURRENCIES[code];
    const format = (cadAmount: number, opts?: { decimals?: number }) => {
      const converted = cadAmount * currency.rate;
      const decimals = opts?.decimals ?? 0;
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(converted);
      return `${currency.symbol}${formatted}`;
    };
    const convertPriceString = (cadString: string) => {
      const match = cadString.match(/\$?([\d,]+(?:\.\d+)?)/);
      if (!match) return cadString;
      const num = parseFloat(match[1].replace(/,/g, ""));
      if (isNaN(num)) return cadString;
      return format(num);
    };
    return { currency, setCurrency, format, convertPriceString };
  }, [code]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};