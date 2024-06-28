const createSingleRequestEnforcer = () => {
  let isProcessing = false;

  const resetProcessing = () => {
    isProcessing = false;
  };

  return async (req, res, next) => {
    if (isProcessing) {
      console.error('Too many requests');

      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Only one request is allowed at a time.',
      });
    }

    isProcessing = true;

    // Reset the processing flag when the response is finished or closed
    res.on('finish', resetProcessing);
    res.on('close', resetProcessing);

    next();
  };
};

module.exports = {
  createSingleRequestEnforcer,
};
