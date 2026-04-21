import { NextResponse } from 'next/server';
import { fetchExchangeRates, getCachedRates } from '@/lib/currency';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// GET /api/exchange-rates - Get current exchange rates
export async function GET() {
  try {
    const response = await fetchExchangeRates('ZAR');
    
    return NextResponse.json({
      success: response.success,
      base: response.base,
      rates: response.rates,
      lastUpdated: response.lastUpdated,
      source: response.source,
    });
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}
