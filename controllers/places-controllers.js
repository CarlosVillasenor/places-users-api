const HttpError = require("../models/http-error");
const uuid = require("uuid");
const { validationResult } = require("express-validator");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");

/**
 * Handles GET requests for a single place.
 *
 * @param {import('express').Request} req - Request containing `placeId`.
 * @param {import('express').Response} res - Response used to return the place.
 * @param {import('express').NextFunction} next - Express continuation callback.
 * @returns {void}
 * @throws {HttpError} When no place matches the requested identifier.
 */
const getPlaceById = async (req, res, next) => {
  // Extract the place ID from the request parameters.
  const placeId = req.params.placeId;
  // Initialize a variable to hold the place retrieved from the database.
  let place;

  try {
    console.log("Fetching place with ID:", placeId);
    // Attempt to find the place by its ID in the database.
    place = await Place.findById(placeId);
  } catch (error) {
    // Handle any errors that occur during the database query. with an appropriate HTTP error response.
    const err = new HttpError(
      "Something went wrong, could not find a place.",
      500,
    );

    return next(err);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404,
    );

    // Pass the error to the next middleware for handling.
    return next(error);
  }

  // getters is truthy to include the `id` field in the JSON response.
  res.json({ place: place.toObject({ getters: true }) });
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
const getPlacesByUserId = async (req, res, next) => {
  // Extract the user ID from the request parameters.
  const userId = req.params.userId;
  let places;

  try {
    // Attempt to find all places created by the specified user in the database.
    places = await Place.find({ creator: userId });
  } catch (error) {
    const err = new HttpError(
      "Fetching places failed, please try again later.",
      500,
    );

    return next(err);
  }

  if (!places || places.length === 0) {
    const error = new HttpError(
      "Could not find places for the provided user id",
      404,
    );
    return next(error);
  }

  // Return the found places as a JSON response, converting each to an object with `id` included.
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
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
      new HttpError("Invalid inputs passed, please check your data.", 422),
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
      "https://images.squarespace-cdn.com/content/v1/620bb50c00af5319710b2218/2d188987-4180-421b-94ec-7172c9358460/Flowers-background-blur.jpg",
    location: coordinates,
    address,
    creator,
  });

  try {
    await newPlace.save();
  } catch (error) {
    console.error("Creating place failed:", error);

    const err = new HttpError("Creating place failed, please try again.", 500);

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
const updatePlace = async (req, res, next) => {
  // Validate the incoming request data.
  const errors = validationResult(req);

  // Check for validation errors from express-validator.
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.placeId;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError(
      "Something went wrong, could not update place.",
      500,
    );
    return next(err);
  }

  place.title = title;
  place.description = description;

  // Attempt to save the updated place to the database.
  try {
    await place.save();
  } catch (error) {
    const err = new HttpError(
      "Something went wrong, could not update place.",
      500,
    );
    return next(err);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

/**
 *
 * @param {import('express').Request} req - Request containing the place ID in its parameters.
 * @param {import('express').Response} res - Response used to return the deletion status.
 * @param {import('express').NextFunction} next - Express continuation callback.
 */
const deletePlace = async (req, res, next) => {
  // Find the index of the place to be deleted in the in-memory collection.
  const placeId = req.params.placeId;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place. Place was not found.",
      500,
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404,
    );
    return next(error);
  }

  console.log(place);

  // Attempt to remove the place from the database.
  try {
    await place.deleteOne();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500,
    );
    return next(error);
  }

  res.status(200).json({ message: "Place deleted successfully." });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
