const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found.' });
};

module.exports = { errorHandler, notFound };
