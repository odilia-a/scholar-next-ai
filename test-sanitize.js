try {
  const sanitize = require('./src/middleware/sanitize.middleware');
  console.log('sanitize module loaded:', typeof sanitize === 'function');
} catch (err) {
  console.error('load error', err && err.message);
  process.exit(1);
}
