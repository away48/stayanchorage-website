import { NextRequest, NextResponse } from 'next/server';

const BEDS24_API = 'https://api.beds24.com/json/v2';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const propertyId = searchParams.get('propertyId');

  // Check if API credentials are configured
  if (!process.env.BEDS24_API_KEY || !process.env.BEDS24_PROP_KEY) {
    // Return placeholder prices when API not configured
    return NextResponse.json({
      configured: false,
      message: 'Using placeholder prices - Beds24 API not configured',
    });
  }

  try {
    const response = await fetch(`${BEDS24_API}/getRates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: process.env.BEDS24_API_KEY,
        propKey: process.env.BEDS24_PROP_KEY,
        propertyId,
        firstNight: checkIn,
        lastNight: checkOut,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ configured: true, ...data });
  } catch (error) {
    console.error('Beds24 API error:', error);
    return NextResponse.json(
      { error: 'Failed to get rates' },
      { status: 500 }
    );
  }
}
