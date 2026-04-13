import React from 'react';
import Select, { components, SingleValueProps, OptionProps } from 'react-select';
import { useCurrency } from '../../context/CurrencyContext';
import { Country } from '../../services/currencyService';
import { Globe } from 'lucide-react';

const CountrySelector: React.FC = () => {
  const { countries, selectedCountry, setCountry, isLoading } = useCurrency();

  const options = countries.map(country => ({
    value: country.code,
    label: country.name,
    country: country
  }));

  const selectedOption = selectedCountry ? {
    value: selectedCountry.code,
    label: selectedCountry.name,
    country: selectedCountry
  } : null;

  const handleChange = (newValue: any) => {
    if (newValue) {
      setCountry(newValue.country);
    }
  };

  const CustomOption = (props: OptionProps<any>) => {
    const { country } = props.data;
    return (
      <components.Option {...props}>
        <div className="flex items-center space-x-2">
          <img src={country.flag} alt={country.name} className="w-5 h-3 object-cover rounded-sm" />
          <span className="text-sm">{country.name}</span>
          <span className="text-[10px] text-gray-400 font-mono ml-auto">{country.currency}</span>
        </div>
      </components.Option>
    );
  };

  const CustomSingleValue = (props: SingleValueProps<any>) => {
    const { country } = props.data;
    return (
      <components.SingleValue {...props}>
        <div className="flex items-center space-x-2">
          <img src={country.flag} alt={country.name} className="w-4 h-2.5 object-cover rounded-sm" />
          <span className="text-xs font-medium hidden sm:inline">{country.name}</span>
          <span className="text-[10px] font-bold text-brand-gold">{country.currency}</span>
        </div>
      </components.SingleValue>
    );
  };

  if (isLoading && !selectedCountry) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <Globe size={16} className="text-brand-dark/20" />
        <div className="h-4 w-20 bg-brand-dark/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative z-50 min-w-[120px]">
      <Select
        options={options}
        value={selectedOption}
        onChange={handleChange}
        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            cursor: 'pointer',
            minHeight: 'auto',
          }),
          indicatorSeparator: () => ({ display: 'none' }),
          dropdownIndicator: (base) => ({
            ...base,
            padding: '2px',
            color: '#141414',
          }),
          menu: (base) => ({
            ...base,
            width: '250px',
            right: 0,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(20, 20, 20, 0.05)',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#F5F5F0' : 'white',
            color: '#141414',
            cursor: 'pointer',
            '&:active': {
              backgroundColor: '#E4E3E0',
            },
          }),
        }}
        placeholder="Select Country"
        isSearchable
      />
    </div>
  );
};

export default CountrySelector;
