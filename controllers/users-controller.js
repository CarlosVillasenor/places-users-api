/**
 * Users Controller
 * 
 * Handles HTTP requests for user authentication and management, including
 * user registration (signup), authentication (login), and user retrieval.
 * 
 * Note: This controller uses in-memory storage with DUMMY_USERS. In production,
 * this should be replaced with a persistent database.
 */

const uuid = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

/**
 * Temporary in-memory user records used until persistent storage is added.
 * In production, this should be replaced with a database query.
 */
const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Test User',
        email: 'test@test.com',
        password: 'testpassword'
    }
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
const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
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
const signup = (req, res, next) => {
  const errors = validationResult(req);
  // Check for validation errors from express-validator.
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  // Extract the user details from the request body.
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new HttpError('Missing required fields', 422);
  }
  if (email && DUMMY_USERS.find(user => user.email === email)) {
    throw new HttpError('User with this email already exists', 422);
  }

  const newUser = {
    id: uuid.v4(),
    name,
    email,
    password
  };

  DUMMY_USERS.push(newUser);
  res.status(201).json({ user: newUser });
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
const login = (req, res, next) => {
  const { email, password } = req.body;

  const existingUser = DUMMY_USERS.find(user => user.email === email && user.password === password);

  if (!existingUser) {
    throw new HttpError('Could not identify user, invalid credentials', 401);
  }

  res.status(200).json({ message: 'Login successful', user: existingUser });
};

module.exports = {
  getUsers,
  signup,
  login
};
