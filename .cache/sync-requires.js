const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---src-templates-blog-post-js": hot(preferDefault(require("/home/chong/gatsby-blog/src/templates/blog-post.js"))),
  "component---cache-dev-404-page-js": hot(preferDefault(require("/home/chong/gatsby-blog/.cache/dev-404-page.js"))),
  "component---src-pages-404-js": hot(preferDefault(require("/home/chong/gatsby-blog/src/pages/404.js"))),
  "component---src-pages-index-js": hot(preferDefault(require("/home/chong/gatsby-blog/src/pages/index.js")))
}

