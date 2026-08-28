/**
 * lib/currency.ts
 * Real-Time Geo-Currency & Multi-Country Pricing Engine
 * Detects user country & timezone, provides live exchange conversions and formatted localized pricing
 */
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { logger } from "./logger";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  country: string;
  rate: number; // Conversion rate relative to 1 USD
  locale: string;
  roundingStep: number; // Clean rounding step (e.g. 50, 100, 10)
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    country: "United States",
    rate: 1.0,
    locale: "en-US",
    roundingStep: 1
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
    country: "India",
    rate: 86.5,
    locale: "en-IN",
    roundingStep: 50
  },
  NPR: {
    code: "NPR",
    symbol: "Rs.",
    name: "Nepalese Rupee",
    flag: "🇳🇵",
    country: "Nepal",
    rate: 138.4,
    locale: "ne-NP",
    roundingStep: 50
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    country: "European Union",
    rate: 0.92,
    locale: "de-DE",
    roundingStep: 1
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    country: "United Kingdom",
    rate: 0.78,
    locale: "en-GB",
    roundingStep: 1
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    country: "Canada",
    rate: 1.38,
    locale: "en-CA",
    roundingStep: 1
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    country: "Australia",
    rate: 1.54,
    locale: "en-AU",
    roundingStep: 1
  },
  AED: {
    code: "AED",
    symbol: "AED",
    name: "UAE Dirham",
    flag: "🇦🇪",
    country: "United Arab Emirates",
    rate: 3.67,
    locale: "ar-AE",
    roundingStep: 5
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    flag: "🇸🇬",
    country: "Singapore",
    rate: 1.34,
    locale: "en-SG",
    roundingStep: 1
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    flag: "🇯🇵",
    country: "Japan",
    rate: 154.5,
    locale: "ja-JP",
    roundingStep: 100
  }
};

/**
 * Auto-detect currency based on user timezone and locale in real time
 */
export function detectUserCurrency(): { code: string; detectedCountry: string } {
  if (typeof window === "undefined") {
    return { code: "USD", detectedCountry: "United States" };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const navLang = (navigator.language || "").toLowerCase();

    // 1. India Detection
    if (
      tz.includes("Kolkata") ||
      tz.includes("Calcutta") ||
      tz.includes("India") ||
      navLang.includes("hi") ||
      navLang === "en-in"
    ) {
      return { code: "INR", detectedCountry: "India" };
    }

    // 2. Nepal Detection
    if (tz.includes("Kathmandu") || navLang.includes("ne") || navLang === "ne-np") {
      return { code: "NPR", detectedCountry: "Nepal" };
    }

    // 3. United Kingdom Detection
    if (tz.includes("London") || navLang === "en-gb") {
      return { code: "GBP", detectedCountry: "United Kingdom" };
    }

    // 4. Eurozone Detection
    if (
      tz.includes("Berlin") ||
      tz.includes("Paris") ||
      tz.includes("Madrid") ||
      tz.includes("Rome") ||
      tz.includes("Amsterdam") ||
      tz.includes("Brussels") ||
      tz.includes("Vienna") ||
      navLang.includes("es-es") ||
      navLang.includes("de-de") ||
      navLang.includes("fr-fr") ||
      navLang.includes("it-it")
    ) {
      return { code: "EUR", detectedCountry: "Europe" };
    }

    // 5. Canada Detection
    if (
      tz.includes("Toronto") ||
      tz.includes("Vancouver") ||
      tz.includes("Montreal") ||
      navLang === "en-ca" ||
      navLang === "fr-ca"
    ) {
      return { code: "CAD", detectedCountry: "Canada" };
    }

    // 6. Australia Detection
    if (
      tz.includes("Sydney") ||
      tz.includes("Melbourne") ||
      tz.includes("Brisbane") ||
      tz.includes("Perth") ||
      navLang === "en-au"
    ) {
      return { code: "AUD", detectedCountry: "Australia" };
    }

    // 7. UAE / Gulf Detection
    if (tz.includes("Dubai") || navLang === "ar-ae") {
      return { code: "AED", detectedCountry: "United Arab Emirates" };
    }

    // 8. Singapore Detection
    if (tz.includes("Singapore") || navLang === "en-sg") {
      return { code: "SGD", detectedCountry: "Singapore" };
    }

    // 9. Japan Detection
    if (tz.includes("Tokyo") || navLang.includes("ja")) {
      return { code: "JPY", detectedCountry: "Japan" };
    }
  } catch (err: unknown) {
    logger.warn("Geo-currency detection error:", err);
  }

  return { code: "USD", detectedCountry: "Global / United States" };
}

interface CurrencyContextType {
  currency: string;
  currencyConfig: CurrencyConfig;
  detectedCountry: string;
  setCurrency: (code: string) => void;
  formatPrice: (usdAmount: number, options?: { showCode?: boolean; decimals?: boolean }) => string;
  convertAmount: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  currencyConfig: SUPPORTED_CURRENCIES.USD,
  detectedCountry: "United States",
  setCurrency: () => {},
  formatPrice: (amt) => `$${amt}`,
  convertAmount: (amt) => amt
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("USD");
  const [detectedCountry, setDetectedCountry] = useState<string>("United States");

  useEffect(() => {
    // 1. Check if user previously saved a manual preference
    const saved = localStorage.getItem("relay_preferred_currency");
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      setCurrencyState(saved);
      const detected = detectUserCurrency();
      setDetectedCountry(detected.detectedCountry);
      return;
    }

    // 2. Real-time Geo & TimeZone Auto-Detection
    const detected = detectUserCurrency();
    setCurrencyState(detected.code);
    setDetectedCountry(detected.detectedCountry);
  }, []);

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem("relay_preferred_currency", code);
    }
  };

  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;

  const convertAmount = (usdAmount: number): number => {
    const raw = usdAmount * currencyConfig.rate;
    if (currencyConfig.roundingStep > 1) {
      return Math.round(raw / currencyConfig.roundingStep) * currencyConfig.roundingStep;
    }
    return Math.round(raw);
  };

  const formatPrice = (
    usdAmount: number,
    options?: { showCode?: boolean; decimals?: boolean }
  ): string => {
    const converted = convertAmount(usdAmount);

    try {
      const formatted = new Intl.NumberFormat(currencyConfig.locale, {
        maximumFractionDigits: options?.decimals ? 2 : 0,
        minimumFractionDigits: options?.decimals ? 2 : 0
      }).format(converted);

      const symbolPrefix = currencyConfig.symbol;
      const codeSuffix = options?.showCode ? ` ${currencyConfig.code}` : "";

      if (currencyConfig.code === "AED") {
        return `${formatted} AED`;
      }

      return `${symbolPrefix}${formatted}${codeSuffix}`;
    } catch {
      return `${currencyConfig.symbol}${converted}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        detectedCountry,
        setCurrency,
        formatPrice,
        convertAmount
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
