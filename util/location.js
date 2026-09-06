/**
 * Location Utility
 * 
 * Provides geolocation services by converting street addresses into
 * geographic coordinates (latitude and longitude) using the Google
 * Geocoding API.
 */

const axios = require("axios");
// WARNING: API key is exposed in source code. Should be moved to environment variables.
const API_KEY = "AIzaSyAwooPY6coIvBoX_-uQwU1awUJd_7TcgWw";
const HttpError = require("../models/http-error");

/**
 * Converts a street address into geographic coordinates (latitude and longitude).
 * 
 * Uses the Google Geocoding API v4 to resolve an address string into
 * precise geographic coordinates. The first result from the API is returned.
 * 
 * @param {string} address - The street address to geocode (e.g., "New York, NY")
 * @returns {Promise<{lat: number, lng: number}>} Object containing latitude and longitude.
 * @throws {HttpError} Status 404 if the address cannot be found or geocoded.
 * 
 * @example
 * const coords = await getCoordsForAddress('20 W 34th St, New York, NY 10001');
 * console.log(coords); // { lat: 40.7484405, lng: -73.9878584 }
 */
async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://geocode.googleapis.com/v4/geocode/address/${encodeURIComponent(address)}?key=${API_KEY}`,
  );

  const data = response.data;

  if (!data || !data.results || data.results.length === 0) {
    const error = new HttpError(
      "Could not find location for the specified address.",
      404
    );
    throw error;
  }

  const coordinates = data.results[0].location;

  return coordinates;
}

module.exports = { getCoordsForAddress };
