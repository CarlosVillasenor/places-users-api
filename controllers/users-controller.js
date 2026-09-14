/**
 * Users Controller
 *
 * Handles HTTP requests for user authentication and management, including
 * user registration (signup), authentication (login), and user retrieval.
 *
 * Note: This controller uses in-memory storage with DUMMY_USERS. In production,
 * this should be replaced with a persistent database.
 */

const uuid = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

/**
 * Temporary in-memory user records used until persistent storage is added.
 * In production, this should be replaced with a database query.
 */
const DUMMY_USERS = [
  {
    id: "u1",
    name: "Test User",
    email: "test@test.com",
    password: "testpassword",
  },
];

/**
 * Retrieves all users from the in-memory store.
 *
 * WARNING: This endpoint exposes all user data including passwords.
 * Should only be used for development/testing purposes.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express continuation callback.
 * @returns {void} Returns JSON array of all users with status 200.
 */
const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500,
    );
    return next(error);
  }

  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

/**
 * Registers a new user with the provided credentials.
 *
 * Validates that name, email, and password are provided, ensures the email
 * is unique, and creates a new user record in the in-memory store.
 *
 * Request body should contain:
 * - name: {string} User's full name
 * - email: {string} User's email address (must be unique)
 * - password: {string} User's password (minimum 6 characters)
 *
 * @param {import('express').Request} req - Request containing signup data in body.
 * @param {import('express').Response} res - Response used to return the created user.
 * @param {import('express').NextFunction} next - Express continuation callback.
 * @returns {void} Returns created user object with status 201.
 * @throws {HttpError} Status 422 if validation fails or email already exists.
 */
const signup = async (req, res, next) => {
  // Validate the incoming request for required fields and correct format.
  const errors = validationResult(req);

  // Check for validation errors from express-validator.
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422,
    );
    return next(error);
  }

  // Extract the user details from the request body.
  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500,
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User already exists, please login instead.",
      422,
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password,
    image:
      "https://static.vecteezy.com/system/resources/previews/023/211/970/large_2x/avatar-icon-sample-vector.jpg",
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500,
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

/**
 * Authenticates a user by verifying email and password credentials.
 *
 * Searches the in-memory store for a user matching the provided email and
 * password combination. Returns user data on successful authentication.
 *
 * Request body should contain:
 * - email: {string} User's email address
 * - password: {string} User's password
 *
 * @param {import('express').Request} req - Request containing login credentials in body.
 * @param {import('express').Response} res - Response used to return authentication result.
 * @param {import('express').NextFunction} next - Express continuation callback.
 * @returns {void} Returns success message and user object with status 200 on successful login.
 * @throws {HttpError} Status 401 if credentials are invalid.
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500,
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401,
    );
    return next(error);
  }

  res.json({
    message: "Login successful",
    user: existingUser.toObject({ getters: true }),
  });
};

module.exports = {
  getUsers,
  signup,
  login,
};
