const HttpError = require('../models/http-error');
const uuid = require('uuid');
const { validationResult } = require('express-validator');
const { getCoordsForAddress } = require('../util/location');
const Place = require('../models/place');

/**
 * Temporary in-memory place records used until persistent storage is added.
 */

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'Famous skyscraper in New York City',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
];

/**
 * Handles GET requests for a single place.
 *
 * @param {import('express').Request} req - Request containing `placeId`.
 * @param {import('express').Response} res - Response used to return the place.
 * @param {import('express').NextFunction} next - Express continuation callback.
 * @returns {void}
 * @throws {HttpError} When no place matches the requested identifier.
 */
const getPlaceById = (req, res, next) => {
  const placeId = req.params.placeId;
  const place = DUMMY_PLACES.find(p => p.id === placeId);

  if (place) {
    res.json({place});
  } else {
    const error = new HttpError('Could not find a place for the provided id', 404);
    throw error;
  }
};

/**
 * Handles GET requests for all places created by one user.
 *
 * @param {import('express').Request} req - Request containing `userId`.
 * @param {import('express').Response} res - Response used to return matching places.
 * @param {import('express').NextFunction} next - Express continuation callback.
 * @returns {void}
 * @throws {HttpError} When the user has no associated places.
 */
const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.userId;
  const places = DUMMY_PLACES.filter(p => p.creator === userId);

  if (places.length > 0) {
    res.json({places});
  } else {
    const error = new HttpError('Could not find places for the provided user id', 404);
    throw error;
  }
};

/**
 * Handles POST requests that create a place in the in-memory collection.
 *
 * The request body should contain `title`, `description`, `coordinates`,
 * `address`, and `creator`. The coordinates are stored as the place's
 * `location` value.
 *
 * @param {import('express').Request} req - Request containing place details in its body.
 * @param {import('express').Response} res - Response used to return the created place.
 * @param {import('express').NextFunction} next - Express continuation callback.
 * @returns {void}
 */
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  // Check for validation errors from express-validator.
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422),
    );
  }

  // Extract place details from the request body.
  const { title, description, address, creator } = req.body;

  let coordinates;

  // Get geographic coordinates for the provided address.
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // Create a new place document.
  const newPlace = new Place({
    title,
    description,
    image:
      'https://images.squarespace-cdn.com/content/v1/620bb50c00af5319710b2218/2d188987-4180-421b-94ec-7172c9358460/Flowers-background-blur.jpg',
    location: coordinates,
    address,
    creator,
  });

  try {
    await newPlace.save();
  } catch (error) {
    console.error('Creating place failed:', error);

  const err = new HttpError(
    'Creating place failed, please try again.',
    500
  );

  return next(err);
  }

  res.status(201).json({
    place: newPlace,
  });
};

/**
 * Handles PATCH requests that update a place in the in-memory collection.
 *
 * The request body should contain `title` and `description`.
 *
 * @param {import('express').Request} req - Request containing place details in its body.
 * @param {import('express').Response} res - Response used to return the updated place.
 * @param {import('express').NextFunction} next - Express continuation callback.
 * @returns {void}
 */
const updatePlace = (req, res, next) => {
  const errors = validationResult(req);

  // Check for validation errors from express-validator.
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.placeId;
  const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId)};
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace });
};

/**
 * 
 * @param {import('express').Request} req - Request containing the place ID in its parameters.
 * @param {import('express').Response} res - Response used to return the deletion status.
 * @param {import('express').NextFunction} next - Express continuation callback.
 */
const deletePlace = (req, res, next) => {
  // Find the index of the place to be deleted in the in-memory collection.
  const placeId = req.params.placeId;
  // Find the index of the place to be deleted.
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

  if (placeIndex >= 0) {
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: 'Place deleted successfully.' });
  } else {
    const error = new HttpError('Could not find a place for the provided id', 404);
    throw error;
  }
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace
};
