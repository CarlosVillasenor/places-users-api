const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator").default;
/**
 * MongoDB schema for a user.
 *
 * @property {string} name - Full name of the user.
 * @property {string} email - Email address of the user.
 * @property {string} password - Hashed password of the user.
 * @property {string} image - URL of the user's profile image.
 */
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true }
});

// Apply the uniqueValidator plugin to userSchema to ensure unique fields.
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
