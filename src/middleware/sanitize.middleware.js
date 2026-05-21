const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const sanitize = (app) => {
  app.use(mongoSanitize()); // prevents NoSQL injection
  app.use(xss()); // prevents script injection
};

module.exports = sanitize;