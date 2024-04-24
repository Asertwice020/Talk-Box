class ApiResponse {
  constructor(
    statusCode = null,
    message = "API IS WORKING! (DEFAULT-MSG)",
    data = null
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
