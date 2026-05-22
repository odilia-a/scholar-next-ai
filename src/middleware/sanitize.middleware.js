const expressMongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const sanitize = (app) => {
  app.use((req, res, next) => {
    ["body", "params", "headers", "query"].forEach((key) => {
      if (req[key] && typeof expressMongoSanitize.sanitize === "function") {
        expressMongoSanitize.sanitize(req[key]);
      }
    });
    next();
  });

  app.use(xss()); // prevents script injection
};

module.exports = sanitize;