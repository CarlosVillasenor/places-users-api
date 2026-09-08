const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * MongoDB schema for a place created by a user.
 *
 * @property {string} title - Display name of the place.
 * @property {string} description - Details about the place.
 * @property {string} address - Human-readable address of the place.
 * @property {string} image - URL of the place image.
 * @property {{lat: number, lng: number}} location - Geographic coordinates.
 * @property {mongoose.Types.ObjectId} creator - User who created the place.
 */
const placeSchema = new Schema({
  /** Display name of the place. */
  title: { type: String, required: true },
  /** Details about the place. */
  description: { type: String, required: true },
  /** Human-readable address of the place. */
  address: { type: String, required: true },
  /** URL of the image associated with the place. */
  image: { type: String, required: true },
  location: {
    /** Latitude of the place. */
    latitude: { type: Number, required: true },
    /** Longitude of the place. */
    longitude: { type: Number, required: true }
  },
  /** Reference to the user who created the place. */
  // creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
  creator: { type: String, required: true, ref: 'User' }
});

/** Mongoose model used to create and query place documents. */
module.exports = mongoose.model('Place', placeSchema);