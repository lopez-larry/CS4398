// middleware/sanitizeInput.js
const sanitize = require('mongo-sanitize');

module.exports = function (req, res, next) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};
