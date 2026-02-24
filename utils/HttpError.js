// Custom HTTP Error class for better error handling
class HttpError extends Error {
  // Constructor that accepts error message and HTTP status code
  constructor(message, errorCode) {
    super(message); // Call parent Error constructor
    this.code = errorCode; // Set the HTTP status code
  }
}

module.exports = HttpError;
