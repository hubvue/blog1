---
title: Vue插件机制解析
date: '2019-10-20'
description: 深入源码解析Vue的插件机制
---

### 前言

现在的工作使用 Vue 比较频繁，于是就想了解一下 Vue 原理上的东西，就先拿 Vue 的插件机制开刀吧。

Vue 的插件机制就是一个 API，即`Vue.use()`。

当我们在项目中使用 Vuex 的时候，肯定会写这样一段代码。

```js
import Vuex from 'vuex'

Vue.use(Vuex)
```

没有看过原理之前一直都觉得`Vue.use`这个 API 好强大，就 use 了一下，就可以在整个项目中使用 Vuex。现在看了一下源码，也不过尔尔。

### Vue.use

`Vue.use`方法在 Vue 源码的`src/core/global-api/use.js`中，打开源码我们就可以看到一`小`段`Vue.use`的代码。

```js
Vue.use = function(plugin: Function | Object) {
  const installedPlugins =
    this._installedPlugins || (this._installedPlugins = [])
  if (installedPlugins.indexOf(plugin) > -1) {
    return this
  }
  const args = toArray(arguments, 1)
  args.unshift(this)
  if (typeof plugin.install === 'function') {
    plugin.install.apply(plugin, args)
  } else if (typeof plugin === 'function') {
    plugin.apply(null, args)
  }
  installedPlugins.push(plugin)
  return this
}
```

整段代码不超过 20 行，😮Vue.use 方法也太强了，20 行不到就写了一个插件系统。仔细看了才明白，Vue 这老大哥定了一个规矩，这个规矩就是：

> Vue 老大哥说：你们这些插件身上必须有一个 install 方法或者你们本身是一个方法，然后我把我自己给你们，你们想干啥干啥 😏

就基本上就是`Vue.use`的作用了，我们来看一下源码做了什么。

首先对于来注册的第三方插件，只能注册一次，不可以重复注册，从下面代码中可以找到答案。

```js
const installedPlugins = this._installedPlugins || (this._installedPlugins = [])
if (installedPlugins.indexOf(plugin) > -1) {
  return this
}
//.........code

installedPlugins.push(plugin)
```

Vue 中维护了一个插件池`_installedPlugins`，先判断当前注册的插件在插件池中是否存在：如果存在直接放弃本地注册；如果不存在执行逻辑，最后把这个插件放入到插件池中。

然后获取到`Vue.use`方法的 arguments，我们都知道 arguments 是一个类数组，将它转换成数据，将 Vue 放在数组的最前面。

```js
const args = toArray(arguments, 1)
args.unshift(this)
```

由于本次调用时`Vue.use`，那么 use 函数中的 this 就是指向的 Vue。

最后就是注册了

```js
if (typeof plugin.install === 'function') {
  plugin.install.apply(plugin, args)
} else if (typeof plugin === 'function') {
  plugin.apply(null, args)
}
```

判断如果插件上有 install 方法，那么就通过 apply 执行，并且把 args 传进去；如果没有就判断插件是一个方法，就通过 apply 执行。

### end

Vue 这种插件机制还是想的挺周到的。因为 Vue 插件必然会用到 Vue，而又避免引入 Vue 造成包体积过大，所以才使用将 Vue 构造函数传入插件这种方法，而且通过这种方式可以让插件有更高的可扩展性，便于在插件内部可以做很多事情。
