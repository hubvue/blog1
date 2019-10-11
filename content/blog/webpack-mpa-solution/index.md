---
title: webpack多页面打包方案
date: '2019-10-11'
description: 分析webpack打包多页的痛点，统一规则，动态配置解决
---

## webpack 打包多页的痛点

我们都知道前端还有一个名字叫 webpack 配置工程师，也表示我们前端在写项目的时候，写 webpack 配置要花费很长的时间。
当 webpack 去打包一个 SPA 的时候还好，配置只需要写一遍就可以了。但是如果使用 webpack 去打包多页，那么配置的工作量将会秩序下去。例如下面这些配置。

```js
module.exports = {
  entry: {
    index: './src/index.js',
    about: './src/index.js'
  }
}
```

上面我们配置了两个入口，如果是打包多页，那么必然会有两个`HTMLWebpackPlugin`去配置 html。

```js
module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: './src/about.html'
    })
  ]
}
```

像上面这些配置，我们配置了两个页面，但是如果后面要继续添加需求的话，我们还是要手动的去配置新的页面。回想一下我们使用 webpack 的目的是什么：配置工程化，解放双手。多页很显然就违背了我们的理念，那么有什么方法解决这样的问题吗？很显然是有的。

## 多页面打包方案

> 对于任何问题，都有特定的规则去解决，而我们解决问题的过程就是寻找规则的过程。

上面说了一句名言 😆，当然对于打包多页也是试用的。

我们只需要规定统一目录结构，比如说我们有两个页面，那么我们的目录结构就配置成

```txt
src/pages/index/index.html
src/pages/about/index.html
```

对于上面两个页面，我们设置两个特定的入口 js 和 html 文件放在一起。

```txt
src/pages/index/index.js
src/pages/about/index.js
```

在 webpack 中我们就可以根据这种规则通过正则去找到其中的不同点：比如说 index 页面的 pageName 为 index，about 页面的 pageName 为 about。

```js
const setMpa = () => {
  let htmlPlugins = []
  let entrys = {}
  const files = glob.sync(resolve('src/pages/**/*.js'))
  for (let file of files) {
    let pageName = file.match(/pages\/[\w\W]*(?=\/index.js)/)[0].split('/')[1]
    entrys[pageName] = `./src/pages/${pageName}/index.js`
    htmlPlugins.push(
      new HtmlWebpackPlugin({
        template: `./src/pages/${pageName}/index.html`,
        filename: `pages/${pageName}.html`,
        chunks: [pageName]
      })
    )
  }
  return {
    entrys,
    htmlPlugins
  }
}
```

我们就可以写这样一个函数，通过正则拿到不同，动态的去配置 entry 和 HtmlWebpackPlugin。

执行这个函数就可以得到 entrys 和 htmlPlugins

```js
const { entrys, htmlPlugins } = setMpa()

module.exports = {
  entry: entrys,
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CleanWebpackPlugin()
  ].concat(htmlPlugins)
}
```

这样之后要添加新页面，只要按照目录的规则去添加，不再需要修改配置了 😁。

## 总结

对于 webpack 打包多页的痛点，我们设计出统一的规则去解决，总体规则如下：

- 统一目录规范
- 统一入口文件
- 使用 glob.sync 获取到所有入口文件
- 正则匹配得到 pageName
- 动态设置 entrys 和 htmlPlugins
