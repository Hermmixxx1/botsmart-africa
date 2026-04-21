'use client';

import { useEffect, useState } from 'react';
import { useStore, SUPPORTED_CURRENCIES } from '@/store/useStore';
import { convertCurrency, formatCurrency } from '@/lib/currency';

interface PriceDisplayProps {
  /** Price in ZAR (base currency) */
  price: number;
  /** Optional original price for showing discounts */
  originalPrice?: number;
  /** Currency to display in (defaults to user's selected currency) */
  currency?: string;
  /** CSS class for the price container */
  className?: string;
  /** Show the currency code */
  showCode?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show strikethrough for original price */
  showStrikethrough?: boolean;
}

/**
 * Displays price in the user's selected currency with automatic conversion
 */
export function PriceDisplay({
  price,
  originalPrice,
  currency: currencyOverride,
  className = '',
  showCode = false,
  size = 'md',
  showStrikethrough = false,
}: PriceDisplayProps) {
  const { currency: selectedCurrency, currency: storeCurrency } = useStore();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const currency = currencyOverride || selectedCurrency;

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  useEffect(() => {
    // Fetch rates on mount
    async function loadRates() {
      try {
        const response = await fetch('/api/exchange-rates');
        if (response.ok) {
          const data = await response.json();
          setRates(data.rates);
        }
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRates();
  }, []);

  // Convert prices
  const convertedPrice = convertCurrency(price, 'ZAR', currency, rates);
  const convertedOriginal = originalPrice 
    ? convertCurrency(originalPrice, 'ZAR', currency, rates)
    : undefined;

  const formattedPrice = formatCurrency(convertedPrice, currency);

  if (showStrikethrough && convertedOriginal) {
    const formattedOriginal = formatCurrency(convertedOriginal, currency);
    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        <span className={`font-bold ${sizeClasses[size]}`}>
          {formattedPrice}
        </span>
        <span className={`text-muted-foreground line-through ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {formattedOriginal}
        </span>
        {showCode && (
          <span className="text-xs text-muted-foreground">({currency})</span>
        )}
      </div>
    );
  }

  return (
    <span className={`font-bold ${sizeClasses[size]} ${className}`}>
      {isLoading ? (
        <span className="animate-pulse">...</span>
      ) : (
        <>
          {formattedPrice}
          {showCode && (
            <span className="text-xs text-muted-foreground ml-1">({currency})</span>
          )}
        </>
      )}
    </span>
  );
}

/**
 * Simple formatted price without conversion (for admin use)
 */
export function formatPrice(price: number, currency: string = 'ZAR'): string {
  return formatCurrency(price, currency);
}

/**
 * Convert price from ZAR to selected currency
 */
export function convertPrice(priceInZAR: number): number {
  const { currency } = useStore.getState();
  return convertCurrency(priceInZAR, 'ZAR', currency);
}
