const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---node-modules-gatsby-plugin-offline-app-shell-js": hot(preferDefault(require("/Users/didi/Desktop/code/gatsby-blog/node_modules/gatsby-plugin-offline/app-shell.js"))),
  "component---src-templates-blog-post-js": hot(preferDefault(require("/Users/didi/Desktop/code/gatsby-blog/src/templates/blog-post.js"))),
  "component---src-pages-404-jsx": hot(preferDefault(require("/Users/didi/Desktop/code/gatsby-blog/src/pages/404.jsx"))),
  "component---src-pages-index-jsx": hot(preferDefault(require("/Users/didi/Desktop/code/gatsby-blog/src/pages/index.jsx")))
}

