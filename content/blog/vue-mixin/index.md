---
title: Vue的mixin机制及mergeOptions解析
date: '2019-10-20'
description: 深入源码解析Vue的mixin机制
---

### 前言

Mixin 也就是混入的意思，就是说通过某种方式将一个对象的一些属性，混入到目标对象身上。对于我个人来说，其实并不太喜欢 Mixin 这是方式的，因为它对开发者来说是透明的，我们不知道什么时候同事去绑定了一个全局的 Mixin，当然用的好那肯定是不方便的，也无奈 Vue 的 Mixin 机制那么强大，所以就驱使我来深入了解它。

### start

mixin 方法在`src/core/global-api`下的`mixin.js`文件中，打包文件我们可以看到以下代码：

```js
export function initMixin(Vue: GlobalAPI) {
  Vue.mixin = function(mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```

`Vue.mixin`方法也非常的简练，内部也是直接调用了 mergeOptions 方法，从方法名字上可以看出`合并Options`就大概知道是什么意思了。我们来看一下 mergeOptions 方法是怎么实现的，先贴一下代码。

```js
export function mergeOptions(
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  // 规范化
  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField(key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```

首先我们看到 mergeOptions 函数传过来的前两个参数为`parent`和`child`，通过 mixin 里面的调用，我们可以知道要把`child`上的属性 merge 到`parent`上

```js
if (process.env.NODE_ENV !== 'production') {
  checkComponents(child)
}
```

首先在开发环境的时候会先检查一下 child 中的 components 属性，我们都知道这里是组件装载的地方，这里要检测一下命名是否正确。

child 也可以是一个方法，如果是一个方法，那么就可以认为这是一个组件，重新赋值 child 为 child.options，下面是源码。

```js
if (typeof child === 'function') {
  child = child.options
}
```

接下来这段代码用于规范化 Props、Inject 已经 Directives。

```js
normalizeProps(child, vm)
normalizeInject(child, vm)
normalizeDirectives(child)
```

我们都知道这三个东西在开发过程中有多种形式存在，就拿最常用的 Props 来说，props 可以是对象也可以是数组，例如：

```js
//数组方式
props: ['type','data', 'info']
// 对象的方式
props: {
  type: {
    type: String,
    default: ''
  },
  data: {
    type: Array,
    default: () =>[]
  },
  info: {
    type: Object,
    default: () => ({})
  }
}
```

可见 Vue 提供了 props 的两种写法，便于我们在开发过程中写代码，但是在 Vue 内部必然要使用一种统一的方式去处理，要不然太浪费精力去处理另外一种情况，也让代码不具有可扩展性，所以就出现对这个多方式的配置有了规范化的处理。

就拿 props 的规范化来说吧

```js
function normalizeProps(options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val) ? val : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
        `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```

这里把 props 规范化都转化成了对象的方式，其它两个也是类似的操作。

接下来的逻辑就是合并了。

```js
if (!child._base) {
  if (child.extends) {
    parent = mergeOptions(parent, child.extends, vm)
  }
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
}
```

首先判断 child 是否被合并过，只有合并过之后才有`_base`这个属性，然后判断 child 是否有 extends 和 mixins 属性，有的话就再次调用 mergeOptions 将它们合并到 parent 上。

最后就是这部分合并逻辑

```js
const options = {}
let key
for (key in parent) {
  mergeField(key)
}
for (key in child) {
  if (!hasOwn(parent, key)) {
    mergeField(key)
  }
}
function mergeField(key) {
  const strat = strats[key] || defaultStrat
  options[key] = strat(parent[key], child[key], vm, key)
}
```

对于 parent 和 child 都调用了 mergeField 函数用来合并，而 mergeField 中获取了 start 函数，看一下这个是干嘛的。

```js
const defaultStrat = function(parentVal: any, childVal: any): any {
  return childVal === undefined ? parentVal : childVal
}
```

defaultStart 只是一个简单的选取函数，判断如果 childVal 不存在，就返回 parentVal，存在就返回 childVal，结合上面逻辑，你可能会想，child 这不就覆盖 parent 上的属性了吗？

在上面还有这段逻辑

```js
for (key in child) {
  if (!hasOwn(parent, key)) {
    mergeField(key)
  }
}
```

在遍历 key 的时候如果 child 的 key 在 parent 存在的话就会忽略。

上面说了`defaultStart`这个取值函数，对于 start 还有一个判断的逻辑

```js
const strat = strats[key] || defaultStrat
```

这里做的是它会根据一些特定的 key 来使用一些特定的函数去处理，例如：`data`，生命周期，特定的`component，directive，filter`，`watch`，`props`，`provide`，``methods`，`inject`，`computed`等等

简单看了一下，这些也比较容易理解，先分析这么多。

### end

本来想看 Vue 的 Mixin 的原理，实则是看的 mergeOptions 的原理，结果一发不可收拾。starts 这个东西还是做的蛮全面的，把特殊的属性都使用特定的方法来处理，受益无穷。
