const { handle } = require('hono/vercel');
const app = require('../dist/app').default;

exports.GET = handle(app);
exports.POST = handle(app);
exports.PUT = handle(app);
exports.DELETE = handle(app);
exports.PATCH = handle(app);
exports.OPTIONS = handle(app);
