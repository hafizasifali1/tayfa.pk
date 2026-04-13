import axios from 'axios';
import { Country as BaseCountry } from '../types';

export interface Country extends BaseCountry {
  flag?: string; // Optional flag for UI
}

export interface ExchangeRates {
  [key: string]: number;
}

export const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await axios.get('/api/countries?isActive=true');
    return response.data.map((c: any) => ({
      ...c,
      currency: c.currencyCode,
      currencySymbol: c.symbol,
      flag: `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`
    })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    const response = await axios.get('/api/currency-rates/latest');
    // The API returns an array of latest rates or a single object if currencyCode is provided
    // If it returns an array: [{currencyCode: 'PKR', rate: '280.50'}, ...]
    const rates: ExchangeRates = { USD: 1 };
    if (Array.isArray(response.data)) {
      response.data.forEach((r: any) => {
        rates[r.currencyCode] = parseFloat(r.rate);
      });
    } else if (response.data && response.data.currencyCode) {
      rates[response.data.currencyCode] = parseFloat(response.data.rate);
    }
    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return { USD: 1 };
  }
};

export const detectUserCountry = async (countries: Country[]): Promise<Country | null> => {
  const findCountry = (code: string) => countries.find(c => c.code.toUpperCase() === code.toUpperCase()) || null;

  // Helper to try an API and return the country code
  const tryApi = async (url: string, key: string): Promise<string | null> => {
    try {
      const response = await axios.get(url, { timeout: 3000 });
      return response.data[key];
    } catch {
      return null;
    }
  };

  // 1. Try a sequence of APIs
  const apis = [
    { url: 'https://ipapi.co/json/', key: 'country_code' },
    { url: 'https://ipwho.is/', key: 'country_code' },
    { url: 'https://freeipapi.com/api/json', key: 'countryCode' },
    { url: 'https://ip-api.com/json', key: 'countryCode' }
  ];

  for (const api of apis) {
    const code = await tryApi(api.url, api.key);
    if (code) {
      const country = findCountry(code);
      if (country) return country;
    }
  }

  // 2. Fallback to browser language (very reliable heuristic)
  const browserLang = navigator.language || '';
  const langCountry = browserLang.split('-')[1];
  if (langCountry) {
    const guessed = findCountry(langCountry);
    if (guessed) return guessed;
  }

  // 3. Final default (silent fallback to avoid console noise)
  return findCountry('US');
};

export const formatPrice = (amount: number, currency: string, symbol: string, locale: string = 'en-US') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
    }).format(amount);
  } catch (e) {
    // Fallback if Intl fails for some reason
    return `${symbol}${amount.toFixed(2)}`;
  }
};
