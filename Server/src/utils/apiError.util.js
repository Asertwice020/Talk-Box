class ApiError extends Error {
  constructor(
    statusCode = null,
    message = "API ERROR HAPPENED (DEFAULT-MSG)",
    debuggingTip = null,
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    debuggingTip && (this.debuggingTip = debuggingTip);
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.data = null;
    this.success = false;

    stack
      ? (this.stack = stack)
      : Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };
