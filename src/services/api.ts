const BASE_URL = 'https://demohotelsapi.pythonanywhere.com/hotels/';

export interface Hotel {
  id: number;
  name: string;
  price: string; // The API returns price as string, e.g. "3017.74"
  thumbnail: string;
  rating: number;
  location: string;
  description: string;
  photos: string[];
}

export interface GetHotelsParams {
  location?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  max_rating?: number;
  search?: string;
  limit?: number;
  skip?: number;
  order_by?: string;
}

export interface HotelsResponse {
  count: number;
  returned: number;
  data: Hotel[];
}

// Utility to clean empty params and format them for URL query string
const buildQueryString = (params: GetHotelsParams): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  
  const str = query.toString();
  return str ? `?${str}` : '';
};

export const api = {
  // Fetch list of hotels based on filter/pagination parameters
  async getHotels(params: GetHotelsParams = {}): Promise<HotelsResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${BASE_URL}${queryString}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    // The API wraps search results inside an object with a "data" array,
    // but default list (without queries) might be a raw array. Let's normalize it.
    if (Array.isArray(result)) {
      return {
        count: result.length,
        returned: result.length,
        data: result,
      };
    } else if (result && result.data && Array.isArray(result.data)) {
      return {
        count: result.count !== undefined ? result.count : result.data.length,
        returned: result.returned !== undefined ? result.returned : result.data.length,
        data: result.data,
      };
    }
    
    return { count: 0, returned: 0, data: [] };
  },

  // Fetch details of a single hotel by ID
  async getHotelById(id: number): Promise<Hotel> {
    const response = await fetch(`${BASE_URL}${id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    // Normalize wrapped response vs raw object
    if (result && result.data && !Array.isArray(result.data)) {
      return result.data;
    }
    return result;
  },

  // Create a new hotel (POST)
  async createHotel(hotelData: Omit<Hotel, 'id'>): Promise<Hotel> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hotelData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create hotel (status: ${response.status})`);
    }
    const result = await response.json();
    return result.data || result;
  },

  // Update an existing hotel (PATCH)
  async updateHotel(id: number, hotelData: Partial<Hotel>): Promise<Hotel> {
    const response = await fetch(`${BASE_URL}${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hotelData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update hotel (status: ${response.status})`);
    }
    const result = await response.json();
    return result.data || result;
  },

  // Delete a hotel (DELETE)
  async deleteHotel(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete hotel (status: ${response.status})`);
    }
  }
};
