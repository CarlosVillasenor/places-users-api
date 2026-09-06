/**
 * Router that defines user-related API endpoints.
 */

// Import the Express framework and create a router for user-related routes.
const express = require('express');
// Import the users controller to handle user-related requests.
const usersController = require('../controllers/users-controller.js');
// Import the express-validator package for request validation.
const { check } = require('express-validator');

/**
 * Routes for user auth, mounted under /api/users in app.js.
 */
const router = express.Router();

/**
 * Retrieves all users. This is primarily for development and debugging
 * purposes, as it exposes all user data including sensitive information.
 */
router.get('/', usersController.getUsers);

/**
 * Endpoint for user registration.
 */
router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

/**
 * Endpoint for user login.
 */
router.post('/login', usersController.login);

module.exports = router;