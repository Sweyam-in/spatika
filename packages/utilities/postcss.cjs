// CommonJS entry for PostCSS configs that `require()` plugins (Next.js with webpack).
// Needs a Node.js version that can require ES modules (20.19+, 22.12+).
const mod = require("./dist/postcss.js");
const plugin = mod.default ?? mod;
module.exports = plugin;
module.exports.postcss = true;
