/**
 * Application entry point. Configures JSON parsing, mounts API routes, and
 * starts the HTTP server.
 */
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

/**
 * Express application configured with the API routes for places.
 */
const app = express();

/**
 * Parses JSON request bodies before they reach API route handlers.
 */
app.use(bodyParser.json());

/**
 * Configures Cross-Origin Resource Sharing (CORS) headers to allow
 * requests from any origin and specify allowed headers and methods.
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

/**
 * Registers places endpoints under the /api/places base path.
 */
app.use('/api/places', placesRoutes);

/**
 * Registers user endpoints under the /api/users base path.
 */
app.use('/api/users', usersRoutes);

/**
 * Handles requests that do not match a registered API endpoint.
 */
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
}); 

/**
 * Converts errors from route handlers into JSON HTTP responses.
 */
app.use((error, req, res, next) => {
  // Check if the response headers have already been sent.
  res.status(error.code || 500);
  // Set the HTTP status code for the response based on the error object.
  res.json({
    message: error.message || "An unknown error occurred!",
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });

