---
title: 深入探究ReactDom.render方法执行过程
date: '2019-09-14'
description: 深入源码，探究React.render方法的执行过程。
---

### 前言

前段时间组内老大找我谈话，当聊到看源码的时候，向我分析出了看源码的两个阶段

- 第一个阶段：了解源码的执行过程
- 第二个阶段：明白源码作者为什么要这么做

我当时就很感慨(原来我第一个阶段都没有达到)，其实很多看源码的同学都处于第一个阶段，因为第二个阶段除了作者本身以及源码贡献者，能够了解作者本意是很难的一件事。

读源码是一个学习的过程，仅仅第一个阶段对我们的收益也同样是无限大的。个人觉得有一下几点好处：

1. 能够极大的提高我们写的代码的稳定性，因为我们已经明白内部是怎样一个过程，在写代码的时候就可以避免错误的出现
2. 能够了解框架本身特性的实现方法，有助于学习
3. 明白内部原理，在这个技术迭代飞快的时代更能站住脚

至于第二个阶段，由于本身并没有触碰到，所以不敢评论，如果有大佬达到，可以分享一下。

本篇文章是对 ReactDom.render 方法执行过程的探究，版本是 16.8.6。

### ReactDom.render 到底做了啥？

在写 React 的时候，无论是使用 create-react-app 生成的项目还是使用 webpack 自己搭建的项目，基本上都会接触到一个方法

```jsx
import { render } from 'react-dom'
render(<App />, document.querySelector('#root'))
```

这个 render 函数到底干了什么呢？接下来我们一起来深入源码揭开它神秘的面纱。

> 前提声明：源码中 Dev 的代码不进行解析。

首先定位到源码中 render 方法

```js
render(element, container, callback) {

  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback
  )
}
```

render 函数接收了三个参数：

1. 第一个参数是我们写的 App 组件
2. 第二个参数是渲染到 html 上的 Dom 元素，也就是我们的#root
3. 第三个参数是 render 执行完成后执行的回调

在 render 中什么也没有做直接调用了`legacyRenderSubtreeIntoContainer`方法并传进去一堆参数(先记录下传的是什么)。

下面定位到`legacyRenderSubtreeIntoContainer`函数中

```js
function legacyRenderSubtreeIntoContainer(
  parentComponent,
  children,
  container,
  forceHydrate,
  callback
) {
  let root: Root = (container._reactRootContainer: any)
  if (!root) {
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate
    )
    if (typeof callback === 'function') {
      const originalCallback = callback
      callback = function() {
        const instance = getPublicRootInstance(root._internalRoot)
        originalCallback.call(instance)
      }
    }
    unbatchedUpdates(() => {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback
        )
      } else {
        root.render(children, callback)
      }
    })
  } else {
    if (typeof callback === 'function') {
      const originalCallback = callback
      callback = function() {
        const instance = getPublicRootInstance(root._internalRoot)
        originalCallback.call(instance)
      }
    }
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback
      )
    } else {
      root.render(children, callback)
    }
  }
  return getPublicRootInstance(root._internalRoot)
}
```

首先分析一下参数是什么：

1. parentComponent：渲染的父组件，render 入口可得为 null
2. children：我们的 App 组件
3. container：渲染到 html 上的 dom 容器
4. forceHydrate：是否为 hydrate 模式渲染，对服务端渲染了解的同学一定知道这个 API，render 入口为 false
5. callback：渲染完成执行的回调函数

在`legacyRenderSubtreeIntoContainer`中一共做了两件事：

1. 实例化 ReactRoot，其中实例化了 FiberRoot 和 RootFiber
2. unbatchedUpdates(非批处理)同步更新

我们先来看如何得到一个 ReactRoot，定位到`legacyCreateRootFromDOMContainer`方法

```js
function legacyCreateRootFromDOMContainer(container, forceHydrate) {
  const shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container)
  if (!shouldHydrate) {
    let warned = false
    let rootSibling
    while ((rootSibling = container.lastChild)) {
      // 这里就是清理操作
      container.removeChild(rootSibling)
    }
  }
  const isConcurrent = false
  return new ReactRoot(container, isConcurrent, shouldHydrate)
}
```

### 未完待续
