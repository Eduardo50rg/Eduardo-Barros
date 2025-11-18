// A simple routing service using the public OSRM API.
// Note: This is for demo purposes. In a production app, you'd use a robust service
// with an API key (e.g., Mapbox, Google Maps) or host your own OSRM instance.

export interface Route {
    duration: number; // in seconds
    distance: number; // in meters
    geometry: {
        type: 'LineString';
        coordinates: number[][]; // [lng, lat]
    };
    steps: any[];
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 500;

const fetchWithRetry = async (
    start: { lat: number, lng: number },
    end: { lat: number, lng: number },
    retryCount = 0
): Promise<Route | null> => {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Handle specific HTTP errors that are retryable (e.g., server errors)
            if (response.status >= 500 && retryCount < MAX_RETRIES) {
                console.warn(`OSRM API request failed with status ${response.status}. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise(res => setTimeout(res, INITIAL_BACKOFF_MS * Math.pow(2, retryCount)));
                return fetchWithRetry(start, end, retryCount + 1);
            }
            console.error('OSRM API request failed:', response.status, response.statusText);
            return null;
        }
        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            console.error('OSRM could not find a route:', data.message);
            return null;
        }

        const route = data.routes[0];
        return {
            duration: route.duration,
            distance: route.distance,
            geometry: route.geometry,
            steps: route.legs[0]?.steps || [],
        };
    } catch (error) {
        // Handle network errors
        if (retryCount < MAX_RETRIES) {
            console.warn(`Error fetching route from OSRM. Retrying... (${retryCount + 1}/${MAX_RETRIES})`, error);
            await new Promise(res => setTimeout(res, INITIAL_BACKOFF_MS * Math.pow(2, retryCount)));
            return fetchWithRetry(start, end, retryCount + 1);
        }
        console.error("Error fetching route from OSRM after multiple retries:", error);
        return null;
    }
};

export const getRoute = async (
    start: { lat: number, lng: number },
    end: { lat: number, lng: number }
): Promise<Route | null> => {
    return fetchWithRetry(start, end);
};