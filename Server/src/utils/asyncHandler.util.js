// PROMISE
/*
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise
      .resolve( requestHandler(req, res, next) )
      .catch( error => next(error) );
  };
};
*/

// ASYNC-AWAIT
const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    res.status(error?.code || 500).json({
      message: error?.message || "Internal Server Error",
      success: false,
    });
    next(error);
  }
};

export { asyncHandler };