/**
 * Calculates the price inclusive of tax.
 * @param price The base price of the product
 * @param taxRate The tax rate as a percentage (e.g., 8 for 8%)
 * @returns The final price after tax, rounded to 2 decimal places
 */
export const calculatePriceWithTax = (price: number | string, taxRate: number | string = 0): number => {
  const p = typeof price === 'string' ? parseFloat(price) : price;
  const r = typeof taxRate === 'string' ? parseFloat(taxRate) : taxRate;
  
  if (isNaN(p)) return 0;
  if (isNaN(r) || r <= 0) return p;
  
  const total = p * (1 + r / 100);
  return Math.round((total + Number.EPSILON) * 100) / 100;
};

/**
 * Formats a price with currency symbol.
 * @param amount The numeric amount to format
 * @param currency The currency symbol (default: 'PKR')
 * @returns Formatted string e.g., "PKR 8,500.00"
 */
export const formatCurrency = (amount: number, currency: string = 'PKR'): string => {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
