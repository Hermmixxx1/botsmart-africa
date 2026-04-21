'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore, SUPPORTED_CURRENCIES } from '@/store/useStore';
import { fetchExchangeRates, convertCurrency, formatCurrency } from '@/lib/currency';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CurrencySelector() {
  const { currency, setCurrency, getCurrencyInfo } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentCurrency = getCurrencyInfo();

  // Fetch exchange rates on mount
  useEffect(() => {
    async function loadRates() {
      try {
        const response = await fetchExchangeRates('ZAR');
        if (response.success) {
          setRates(response.rates);
        }
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRates();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencyChange = (code: typeof SUPPORTED_CURRENCIES[number]['code']) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-sm font-medium h-9 px-2"
        >
          <Globe className="h-4 w-4" />
          <span>{currentCurrency.flag}</span>
          <span>{currentCurrency.code}</span>
          <span className="text-muted-foreground">{currentCurrency.symbol}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-auto" ref={menuRef}>
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
          Select Currency
        </div>
        {SUPPORTED_CURRENCIES.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => handleCurrencyChange(curr.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{curr.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{curr.code}</span>
                <span className="text-xs text-muted-foreground">{curr.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {Object.keys(rates).length > 0 && (
                <span className="text-xs text-muted-foreground">
                  1 ZAR = {convertCurrency(1, 'ZAR', curr.code, rates).toFixed(4)} {curr.code}
                </span>
              )}
              {currency === curr.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        {isLoading && (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            Loading exchange rates...
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Utility function to format price in selected currency
export function formatPrice(priceInZAR: number): string {
  const { currency } = useStore.getState();
  const rates = useStore.getState().currency;
  
  // Get rates - in a real app, you'd fetch these and store in state
  // For now, we'll use the default conversion
  const converted = convertCurrency(priceInZAR, 'ZAR', currency);
  return formatCurrency(converted, currency);
}
