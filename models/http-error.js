/**
 * Error type that carries an HTTP status code for Express error middleware.
 *
 * @extends Error
 * @property {number} code - HTTP status code associated with the error.
 */
class HttpError extends Error {
  /**
   * Creates an error with a response message and HTTP status code.
   *
   * @param {string} message - Human-readable error description.
   * @param {number} errorCode - HTTP status code to return to the client.
   * @returns {void}
   */
  constructor(message, errorCode) {
    super(message); // Add a "message" property to the error instance.
    this.code = errorCode; // Add a "code" property to the error instance.
  }
}

/**
 * Exports the HTTP-aware error type for use by route handlers.
 */
module.exports = HttpError;
