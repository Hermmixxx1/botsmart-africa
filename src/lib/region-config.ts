// Regional Configuration for The Lebogang Group - Southern Africa
export interface Country {
  code: string;
  name: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  languages: string[];
  phoneCode: string;
  flag: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  countries: string[];
}

// Southern African Countries (Middle to South)
export const SOUTHERN_AFRICAN_COUNTRIES: Country[] = [
  {
    code: 'ZA',
    name: 'South Africa',
    currency: 'South African Rand',
    currencyCode: 'ZAR',
    currencySymbol: 'R',
    languages: ['en', 'af', 'zu', 'xhosa', 'st', 'tn', 'ts'],
    phoneCode: '+27',
    flag: '🇿🇦',
  },
  {
    code: 'NA',
    name: 'Namibia',
    currency: 'Namibian Dollar',
    currencyCode: 'NAD',
    currencySymbol: 'N$',
    languages: ['en', 'af', 'de', 'na', 'kj'],
    phoneCode: '+264',
    flag: '🇳🇦',
  },
  {
    code: 'BW',
    name: 'Botswana',
    currency: 'Botswana Pula',
    currencyCode: 'BWP',
    currencySymbol: 'P',
    languages: ['en', 'tn'],
    phoneCode: '+267',
    flag: '🇧🇼',
  },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    currency: 'Zimbabwean Dollar',
    currencyCode: 'ZWL',
    currencySymbol: '$',
    languages: ['en', 'sn', 'nd'],
    phoneCode: '+263',
    flag: '🇿🇼',
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    currency: 'Mozambican Metical',
    currencyCode: 'MZN',
    currencySymbol: 'MT',
    languages: ['pt', 'mgh', 'vmw', 'ts'],
    phoneCode: '+258',
    flag: '🇲🇿',
  },
  {
    code: 'LS',
    name: 'Lesotho',
    currency: 'Lesotho Loti',
    currencyCode: 'LSL',
    currencySymbol: 'L',
    languages: ['en', 'st'],
    phoneCode: '+266',
    flag: '🇱🇸',
  },
  {
    code: 'SZ',
    name: 'Eswatini',
    currency: 'Swazi Lilangeni',
    currencyCode: 'SZL',
    currencySymbol: 'E',
    languages: ['en', 'ss'],
    phoneCode: '+268',
    flag: '🇸🇿',
  },
  {
    code: 'AO',
    name: 'Angola',
    currency: 'Angolan Kwanza',
    currencyCode: 'AOA',
    currencySymbol: 'Kz',
    languages: ['pt', 'umb', 'kmb'],
    phoneCode: '+244',
    flag: '🇦🇴',
  },
  {
    code: 'ZM',
    name: 'Zambia',
    currency: 'Zambian Kwacha',
    currencyCode: 'ZMW',
    currencySymbol: 'ZK',
    languages: ['en', 'ny', 'bem', 'loz', 'toi'],
    phoneCode: '+260',
    flag: '🇿🇲',
  },
  {
    code: 'MW',
    name: 'Malawi',
    currency: 'Malawian Kwacha',
    currencyCode: 'MWK',
    currencySymbol: 'MK',
    languages: ['en', 'ny'],
    phoneCode: '+265',
    flag: '🇲🇼',
  },
  {
    code: 'MG',
    name: 'Madagascar',
    currency: 'Malagasy Ariary',
    currencyCode: 'MGA',
    currencySymbol: 'Ar',
    languages: ['mg', 'fr'],
    phoneCode: '+261',
    flag: '🇲🇬',
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'Tanzanian Shilling',
    currencyCode: 'TZS',
    currencySymbol: 'TSh',
    languages: ['sw', 'en', 'ar'],
    phoneCode: '+255',
    flag: '🇹🇿',
  },
];

// Languages spoken in Southern Africa
export const SOUTHERN_AFRICAN_LANGUAGES: Language[] = [
  // English (Widely spoken as official language)
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    countries: ['ZA', 'BW', 'ZW', 'LS', 'SZ', 'ZM', 'MW', 'TZ', 'NG', 'KE'],
  },

  // Portuguese (Angola, Mozambique)
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    countries: ['AO', 'MZ'],
  },

  // French (Madagascar)
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    countries: ['MG'],
  },

  // Afrikaans (South Africa, Namibia)
  {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    countries: ['ZA', 'NA'],
  },

  // Zulu (South Africa)
  {
    code: 'zu',
    name: 'Zulu',
    nativeName: 'isiZulu',
    countries: ['ZA'],
  },

  // Xhosa (South Africa)
  {
    code: 'xhosa',
    name: 'Xhosa',
    nativeName: 'isiXhosa',
    countries: ['ZA'],
  },

  // Sesotho (Lesotho, South Africa)
  {
    code: 'st',
    name: 'Sesotho',
    nativeName: 'Sesotho',
    countries: ['LS', 'ZA'],
  },

  // Tswana (Botswana, South Africa)
  {
    code: 'tn',
    name: 'Tswana',
    nativeName: 'Setswana',
    countries: ['BW', 'ZA'],
  },

  // Shona (Zimbabwe)
  {
    code: 'sn',
    name: 'Shona',
    nativeName: 'chiShona',
    countries: ['ZW'],
  },

  // Ndebele (Zimbabwe, South Africa)
  {
    code: 'nd',
    name: 'Ndebele',
    nativeName: 'isiNdebele',
    countries: ['ZW', 'ZA'],
  },

  // Swahili (Tanzania, parts of Zambia, Mozambique)
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    countries: ['TZ', 'ZM', 'MZ'],
  },

  // Chichewa (Malawi)
  {
    code: 'ny',
    name: 'Chichewa',
    nativeName: 'Chinyanja',
    countries: ['MW', 'ZM', 'MZ'],
  },

  // Arabic (Tanzania, parts of the region)
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    countries: ['TZ', 'MG'],
  },

  // Tsonga (South Africa, Mozambique, Zimbabwe, Swaziland)
  {
    code: 'ts',
    name: 'Tsonga',
    nativeName: 'Xitsonga',
    countries: ['ZA', 'MZ', 'ZW', 'SZ'],
  },

  // German (Namibia)
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    countries: ['NA'],
  },
];

// Currency exchange rates (base: ZAR - would be updated from API in production)
export const EXCHANGE_RATES: Record<string, number> = {
  ZAR: 1.0,      // South African Rand (base)
  NAD: 1.0,      // Namibian Dollar (pegged to ZAR)
  LSL: 1.0,      // Lesotho Loti (pegged to ZAR)
  SZL: 1.0,      // Swazi Lilangeni (pegged to ZAR)
  BWP: 0.14,     // Botswana Pula
  ZWL: 0.004,    // Zimbabwean Dollar
  MZN: 0.03,     // Mozambican Metical
  AOA: 0.011,    // Angolan Kwanza
  ZMW: 0.96,     // Zambian Kwacha
  MWK: 0.009,    // Malawian Kwacha
  MGA: 0.00051,  // Malagasy Ariary
  TZS: 0.0076,   // Tanzanian Shilling
  USD: 18.50,    // US Dollar (for reference)
  EUR: 19.80,    // Euro (for reference)
  GBP: 23.20,    // British Pound (for reference)
};

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return SOUTHERN_AFRICAN_COUNTRIES.find(c => c.code === code);
}

export function getCurrencySymbol(currencyCode: string): string {
  const country = SOUTHERN_AFRICAN_COUNTRIES.find(c => c.currencyCode === currencyCode);
  return country?.currencySymbol || currencyCode;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;

  // Convert to ZAR first, then to target currency
  const amountInZAR = amount * (1 / fromRate);
  return amountInZAR * toRate;
}

export function formatCurrency(
  amount: number,
  currencyCode: string = 'ZAR',
  locale: string = 'en-ZA'
): string {
  const country = getCountryByCode(currencyCode === 'ZAR' ? 'ZA' :
    currencyCode === 'NAD' ? 'NA' :
    currencyCode === 'BWP' ? 'BW' :
    currencyCode === 'ZWL' ? 'ZW' :
    currencyCode === 'MZN' ? 'MZ' :
    currencyCode === 'LSL' ? 'LS' :
    currencyCode === 'SZL' ? 'SZ' :
    currencyCode === 'AOA' ? 'AO' :
    currencyCode === 'ZMW' ? 'ZM' :
    currencyCode === 'MWK' ? 'MW' :
    currencyCode === 'MGA' ? 'MG' :
    currencyCode === 'TZS' ? 'TZ' : 'ZA'
  );

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  try {
    return new Intl.NumberFormat(locale, options).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

// Business specific settings
export const BUSINESS_CONFIG = {
  name: 'The Lebogang Group',
  tagline: 'Your Trusted E-Commerce Partner in Southern Africa',
  defaultCountry: 'ZA',
  defaultCurrency: 'ZAR',
  defaultLanguage: 'en',
  supportedCountries: SOUTHERN_AFRICAN_COUNTRIES.map(c => c.code),
  supportedLanguages: ['en', 'af', 'pt', 'zu', 'xhosa', 'st', 'tn', 'sw', 'ny'],
  supportedCurrencies: SOUTHERN_AFRICAN_COUNTRIES.map(c => c.currencyCode),
  contact: {
    email: 'info@leboganggroup.co.za',
    phone: '+27 11 123 4567',
    address: 'Johannesburg, South Africa',
  },
  social: {
    facebook: 'https://facebook.com/leboganggroup',
    twitter: 'https://twitter.com/leboganggroup',
    linkedin: 'https://linkedin.com/company/leboganggroup',
    instagram: 'https://instagram.com/leboganggroup',
  },
  colors: {
    primary: '#1e3a5f',      // Deep blue
    secondary: '#ffffff',    // White
    accent: '#000000',       // Black
    hover: '#2a4a75',        // Lighter blue for hover states
  },
};
