import { NextRequest, NextResponse } from 'next/server';

const BEDS24_API = 'https://api.beds24.com/json/v2';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const propertyId = searchParams.get('propertyId');

  // Check if API credentials are configured
  if (!process.env.BEDS24_API_KEY || !process.env.BEDS24_PROP_KEY) {
    return NextResponse.json(
      { error: 'Beds24 API not configured', available: true, price: null },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(`${BEDS24_API}/getAvailability`, {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Beds24 API error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
