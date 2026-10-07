// Vercel Serverless Function entry point.
// `npm run build` (tsc) compiles src/ into dist/ before this is bundled.
module.exports = require("../dist/serverless").default;
