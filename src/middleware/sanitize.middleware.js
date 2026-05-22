const xss = require("xss-clean");

const stripDangerousKeys = (target) => {
  if (Array.isArray(target)) {
    target.forEach(stripDangerousKeys);
    return;
  }

  if (target && typeof target === "object") {
    Object.keys(target).forEach((key) => {
      const value = target[key];

      if (/^\$|\./.test(key)) {
        delete target[key];
        return;
      }

      stripDangerousKeys(value);
    });
  }
};

const sanitize = (app) => {
  app.use((req, res, next) => {
    ["body", "params", "headers", "query"].forEach((key) => {
      if (req[key] && typeof req[key] === "object") {
        stripDangerousKeys(req[key]);
      }
    });
    next();
  });

  app.use(xss()); // prevents script injection
};

module.exports = sanitize;