const createSingleRequestEnforcer = () => {
  let isRouteProcessing = false;

  return async (req, res, next) => {
    if (isRouteProcessing) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Only one request is allowed at a time.',
      });
    }

    isRouteProcessing = true;

    try {
      await next();
    } finally {
      isRouteProcessing = false;
    }
  };
};

module.exports = {
  createSingleRequestEnforcer,
};
