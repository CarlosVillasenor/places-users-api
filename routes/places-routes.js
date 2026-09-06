/**
 * Express router for the places API, mounted by the application at
 * `/api/places`.
 */

// Import the Express framework and create a router for places-related endpoints.
const express = require('express');
// Import the controller that handles places-related requests.
const placesController = require('../controllers/places-controllers');
// Import the `check` function from `express-validator` for request validation.
const { check } = require('express-validator');

/**
 * Router that defines places-related API endpoints.
 */
const router = express.Router();

/**
 * Responds to GET /user/:userId with all places created by the specified user,
 * or forwards a 404 error when the user has no places.
 */
router.get('/user/:userId', placesController.getPlacesByUserId);

/**
 * Responds to POST / with the newly created place and a 201 status code.
 * The application mounts this route at /api/places.
 */
router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty()
  ],
  placesController.createPlace
);

/**
 * Responds to GET /:placeId with the matching place, or a 404 error when no
 * place has the requested identifier. This catch-all parameter route must
 * follow the more specific `/user/:userId` route above.
 */
router.get('/:placeId', placesController.getPlaceById);

/**
 * Responds to PATCH /:placeId by updating the specified place.
 */
router.patch(
  '/:placeId',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
  ],
  placesController.updatePlace
);

/**
 * Responds to DELETE /:placeId by removing the specified place.
 */
router.delete('/:placeId', placesController.deletePlace);

/**
 * Exports the router for registration by the Express application.
 */
module.exports = router;
