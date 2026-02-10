/**
 * Beds24 API Client for Stay Anchorage
 * Property ID: 17757
 */

const BEDS24_API = 'https://api.beds24.com/json';
const PROP_ID = process.env.BEDS24_PROP_ID || '5780';
const MIN_NIGHTS = 2;

// Room IDs for Stay Anchorage units
export const ROOM_IDS = {
  'unit-1': '43512',
  'unit-2': '43513', 
  'unit-3': '435186',
  'unit-4': '43514',
};

export const ROOM_INFO: Record<string, { name: string; maxGuests: number; minPrice: number }> = {
  '43512': { name: 'Unit 1', maxGuests: 5, minPrice: 60 },
  '43513': { name: 'Unit 2', maxGuests: 5, minPrice: 60 },
  '435186': { name: 'Unit 3', maxGuests: 5, minPrice: 60 },
  '43514': { name: 'Unit 4', maxGuests: 4, minPrice: 70 },
};

interface AvailabilityResult {
  roomId: string;
  roomsavail: number | string;
  price?: number;
}

export interface RoomAvailability {
  roomId: string;
  name: string;
  available: boolean;
  price: number | null;
  maxGuests: number;
}

export interface AvailabilityResponse {
  rooms: RoomAvailability[];
  minNights: number;
  nights: number;
  error?: string;
}

export async function getAvailability(
  checkIn: string,
  checkOut: string,
  numAdult: number = 2
): Promise<AvailabilityResponse> {
  // Calculate nights
  const ciDate = new Date(checkIn.slice(0,4) + '-' + checkIn.slice(4,6) + '-' + checkIn.slice(6,8));
  const coDate = new Date(checkOut.slice(0,4) + '-' + checkOut.slice(4,6) + '-' + checkOut.slice(6,8));
  const nights = Math.ceil((coDate.getTime() - ciDate.getTime()) / (1000 * 60 * 60 * 24));

  // Check minimum nights requirement
  if (nights < MIN_NIGHTS) {
    return {
      rooms: [],
      minNights: MIN_NIGHTS,
      nights,
      error: `Minimum stay is ${MIN_NIGHTS} nights`,
    };
  }

  try {
    const response = await fetch(BEDS24_API + '/getAvailabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkIn,
        lastNight: checkOut,
        propId: PROP_ID,
        numAdult,
      }),
    });

    const data = await response.json();
    
    const results: RoomAvailability[] = [];
    
    for (const [roomId, info] of Object.entries(ROOM_INFO)) {
      const roomData = data[roomId] as AvailabilityResult | undefined;
      const avail = roomData?.roomsavail;
      const available = avail !== undefined && avail !== '0' && avail !== 0;
      
      results.push({
        roomId,
        name: info.name,
        available,
        price: roomData?.price ?? info.minPrice,
        maxGuests: info.maxGuests,
      });
    }
    
    return { rooms: results, minNights: MIN_NIGHTS, nights };
  } catch (error) {
    console.error('Beds24 API error:', error);
    // Return default availability on error
    return {
      rooms: Object.entries(ROOM_INFO).map(([roomId, info]) => ({
        roomId,
        name: info.name,
        available: true,
        price: info.minPrice,
        maxGuests: info.maxGuests,
      })),
      minNights: MIN_NIGHTS,
      nights,
    };
  }
}
