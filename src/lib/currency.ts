/**
 * Currency Exchange Rate Service
 * Fetches live exchange rates and provides conversion utilities
 */

// Cache for exchange rates (refreshes every hour)
let ratesCache: {
  rates: Record<string, number>;
  lastUpdated: number;
  baseCurrency: string;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Default rates as fallback (based on ZAR)
const DEFAULT_RATES: Record<string, number> = {
  ZAR: 1.0,      // South African Rand (base)
  NAD: 1.0,      // Namibian Dollar (pegged to ZAR)
  LSL: 1.0,      // Lesotho Loti (pegged to ZAR)
  SZL: 1.0,      // Swazi Lilangeni (pegged to ZAR)
  BWP: 0.1385,   // Botswana Pula
  ZWL: 0.0041,   // Zimbabwean Dollar
  MZN: 0.0258,   // Mozambican Metical
  AOA: 0.0105,   // Angolan Kwanza
  ZMW: 0.0942,   // Zambian Kwacha
  MWK: 0.0087,   // Malawian Kwacha
  MGA: 0.00048,  // Malagasy Ariary
  TZS: 0.0074,   // Tanzanian Shilling
  USD: 0.054,    // US Dollar
  EUR: 0.050,    // Euro
  GBP: 0.043,    // British Pound
};

export interface ExchangeRateResponse {
  success: boolean;
  base: string;
  rates: Record<string, number>;
  lastUpdated: number;
  source: 'api' | 'cache' | 'fallback';
}

/**
 * Fetch live exchange rates from API
 * Uses free exchange rate API
 */
export async function fetchExchangeRates(baseCurrency: string = 'ZAR'): Promise<ExchangeRateResponse> {
  const now = Date.now();

  // Return cached rates if still valid
  if (ratesCache && (now - ratesCache.lastUpdated) < CACHE_DURATION) {
    return {
      success: true,
      base: ratesCache.baseCurrency,
      rates: ratesCache.rates,
      lastUpdated: ratesCache.lastUpdated,
      source: 'cache',
    };
  }

  try {
    // Try fetching from exchangerate-api.com (free tier)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform and store rates
    const rates: Record<string, number> = {};
    for (const [code, rate] of Object.entries(data.rates)) {
      rates[code] = rate as number;
    }

    // Cache the rates
    ratesCache = {
      rates,
      lastUpdated: now,
      baseCurrency,
    };

    return {
      success: true,
      base: data.base,
      rates,
      lastUpdated: now,
      source: 'api',
    };
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);

    // Return fallback rates if API fails
    return {
      success: true,
      base: baseCurrency,
      rates: DEFAULT_RATES,
      lastUpdated: now,
      source: 'fallback',
    };
  }
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates?: Record<string, number>
): number {
  const exchangeRates = rates || ratesCache?.rates || DEFAULT_RATES;

  // If same currency, return as-is
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get rates (convert through ZAR as base)
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;

  // Convert: amount / fromRate * toRate
  // If base is ZAR: amount * toRate
  // If base is not ZAR: amount / fromRate * toRate
  if (ratesCache?.baseCurrency === 'ZAR') {
    return amount * toRate;
  } else {
    const amountInBase = amount / fromRate;
    return amountInBase * toRate;
  }
}

/**
 * Format currency amount with proper locale
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale?: string
): string {
  // Map currency codes to locales
  const currencyLocales: Record<string, string> = {
    ZAR: 'en-ZA',
    NAD: 'en-NA',
    BWP: 'en-BW',
    ZWL: 'en-ZW',
    MZN: 'pt-MZ',
    LSL: 'en-LS',
    SZL: 'en-SZ',
    AOA: 'pt-AO',
    ZMW: 'en-ZM',
    MWK: 'en-MW',
    MGA: 'mg-MG',
    TZS: 'sw-TZ',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
  };

  const targetLocale = locale || currencyLocales[currencyCode] || 'en-ZA';

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback format
    return `${getCurrencySymbol(currencyCode)}${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    ZAR: 'R',
    NAD: 'N$',
    BWP: 'P',
    ZWL: '$',
    MZN: 'MT',
    LSL: 'L',
    SZL: 'E',
    AOA: 'Kz',
    ZMW: 'ZK',
    MWK: 'MK',
    MGA: 'Ar',
    TZS: 'TSh',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  return symbols[currencyCode] || currencyCode;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Array<{
  code: string;
  name: string;
  symbol: string;
  countries: string[];
}> {
  return [
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', countries: ['ZA'] },
    { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', countries: ['NA'] },
    { code: 'BWP', name: 'Botswana Pula', symbol: 'P', countries: ['BW'] },
    { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: '$', countries: ['ZW'] },
    { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', countries: ['MZ'] },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', countries: ['LS'] },
    { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E', countries: ['SZ'] },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', countries: ['AO'] },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', countries: ['ZM'] },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', countries: ['MW'] },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', countries: ['MG'] },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', countries: ['TZ'] },
  ];
}

/**
 * Get cached rates (for client-side use)
 */
export function getCachedRates(): Record<string, number> {
  return ratesCache?.rates || DEFAULT_RATES;
}

/**
 * Get last update time
 */
export function getLastUpdateTime(): number | null {
  return ratesCache?.lastUpdated || null;
}
