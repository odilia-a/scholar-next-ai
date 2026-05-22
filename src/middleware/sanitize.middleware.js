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

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const cleanXSS = (target) => {
  if (Array.isArray(target)) {
    target.forEach(cleanXSS);
    return;
  }

  if (target && typeof target === "object") {
    Object.keys(target).forEach((key) => {
      const value = target[key];
      if (typeof value === "string") {
        target[key] = escapeHtml(value);
      } else {
        cleanXSS(value);
      }
    });
  }
};

const sanitize = (app) => {
  app.use((req, res, next) => {
    ["body", "params", "headers", "query"].forEach((key) => {
      if (req[key] && typeof req[key] === "object") {
        stripDangerousKeys(req[key]);
        cleanXSS(req[key]);
      }
    });
    next();
  });
};

module.exports = sanitize;