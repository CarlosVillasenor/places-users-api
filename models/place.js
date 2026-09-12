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
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  creator: { type: String, required: true, ref: 'User' }
});

/** Mongoose model used to create and query place documents. */
module.exports = mongoose.model('Place', placeSchema);