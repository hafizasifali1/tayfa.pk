import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Country, ExchangeRates, fetchCountries, fetchExchangeRates, detectUserCountry } from '../services/currencyService';

interface CurrencyContextType {
  countries: Country[];
  selectedCountry: Country | null;
  selectedState: string;
  exchangeRates: ExchangeRates;
  isLoading: boolean;
  setCountry: (country: Country) => void;
  setState: (state: string) => void;
  convertPrice: (usdAmount: number) => number;
  formatPrice: (usdAmount: number, currency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<string>(() => localStorage.getItem('selected_state') || '');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ USD: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const [countryList, rates] = await Promise.all([
          fetchCountries(),
          fetchExchangeRates(),
        ]);

        setCountries(countryList);
        setExchangeRates(rates);

        // Check local storage
        const savedCountryCode = localStorage.getItem('selected_country');
        let initialCountry = countryList.find(c => c.code === savedCountryCode);

        // Auto-detect if no saved country
        if (!initialCountry) {
          initialCountry = await detectUserCountry(countryList);
        }

        // Fallback to US
        if (!initialCountry) {
          initialCountry = countryList.find(c => c.code === 'US') || countryList[0];
        }

        if (initialCountry) {
          setSelectedCountry(initialCountry);
        }
      } catch (error) {
        console.error('Error initializing currency data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const setCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
    localStorage.setItem('selected_country', country.code);
    // Reset state when country changes
    setSelectedState('');
    localStorage.removeItem('selected_state');
  }, []);

  const setState = useCallback((state: string) => {
    setSelectedState(state);
    localStorage.setItem('selected_state', state);
  }, []);

  const convertPrice = useCallback((usdAmount: number) => {
    if (!selectedCountry || !exchangeRates[selectedCountry.currencyCode]) {
      return usdAmount;
    }
    return usdAmount * exchangeRates[selectedCountry.currencyCode];
  }, [selectedCountry, exchangeRates]);

  const formatPrice = useCallback((usdAmount: number, currencyOverride?: string) => {
    if (!selectedCountry && !currencyOverride) return `$${usdAmount.toFixed(2)}`;
    
    let converted = convertPrice(usdAmount);
    let currencyCode = currencyOverride || selectedCountry?.currencyCode || 'USD';
    
    // If currency override is PKR but selected is USD, we need to convert to PKR
    if (currencyOverride && currencyOverride !== selectedCountry?.currencyCode) {
      const rate = exchangeRates[currencyOverride] || 1;
      converted = usdAmount * rate;
    }

    const locale = navigator.language || 'en-US';
    const symbol = currencyOverride ? '' : (selectedCountry?.symbol || '$');

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      }).format(converted);
    } catch (e) {
      return `${currencyCode} ${converted.toFixed(2)}`;
    }
  }, [selectedCountry, convertPrice, exchangeRates]);

  return (
    <CurrencyContext.Provider value={{ 
      countries,
      selectedCountry, 
      selectedState,
      exchangeRates, 
      isLoading, 
      setCountry, 
      setState,
      convertPrice, 
      formatPrice 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export { fetchCountries };
