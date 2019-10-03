---
title: IOC在Nodejs上的初体验
date: '2019-10-03'
description: 模块间解耦，IOC在Node上的实战
---

## 前言

随着项目需求的增加，Node 模块也相继增加，各模块间的依赖耦合度越来越严重，非常难维护，有时候改一处代码需要懂好几处代码，项目逐渐达到牵一发而动全身的地步，所谓`高内聚、低耦合`完全没得谈，如何做到模块间高度解耦是每个工程师必要思考的问题。

## 设计模式

为了解决模块间依赖耦合的问题，最好的办法就是要找到一种设计模式来帮助我们做到模块间解耦。其中做的很好的两个就是 DI 和 IOC 了，下面来探讨一下这两种设计模式。

## Dependency Injection

`Dependency Injection`简称`DI`,中文是依赖注入的意思。即模块之间的依赖由高层模块在运行期决定，形象的说，当高层模块在运行时确定需要哪个底层模块，并且注入进去。来看下面 🌰。

**noDI**

这里有两个类，一个是数据库类，一个是订单类。

```js
// 订单model类   models/Order.js
class Order {
  constructor() {}
  insert() {
    //......数据库操作
    return true
  }
}

// 订单类 controllers/OrderController.js
const Order = require('./Order.js')

class OrderController {
  constructor() {
    this.order = new Order()
  }
  craeteOrder(...args) {
    this.order.insert(...args)
  }
}

//router/index.js
const OrderController = require('../controllers/OrderController.js')
const orderController = new OrderController()
```

上面是没有依赖注入的情况，可以看出`OrderController`类严重耦合了`Order`类。上面的`OrderController`类依赖了`Order`类，所以在使用的时候就必须先`require` `Order`类，才可以在`OrderController`类中使用。耦合性太高，假如我们需要把`Order`类文件移动到了别的目录，那么所有依赖这个类的文件都需要变化。

**DI**
沿用上面两个类，我们来看一下依赖注入的情况。

```js
// 订单model类   models/Order.js
class Order {
  constructor() {}
  insert() {
    //......数据库操作
    return true
  }
}

// 订单类 controllers/OrderController.js

class OrderController {
  constructor(order) {
    this.order = new order()
  }
  craeteOrder(...args) {
    this.order.insert(...args)
  }
}

//router/index.js
const Order = require('../models/Order.js')
const OrderController = require('../controllers/OrderController.js')
const orderController = new OrderController(new Order())
```

从上面代码来看`OrderController`类文件中已经不需要手动的引入`Order`类了，而是通过 constructor 在运行时的时候传进去。在 router 文件中，当实例化`OrderController`类的时候，同时也实例化`Order`类，并且作为`OrderController`构造函数的参数传进去。

### 小结

可以看出依赖注入已经让我们模块间解耦，但是还是有点不足之处，下面总结一下依赖注入的优点与不足。

**优点**

通过依赖注入的方式，是我们高层模块和底层模块间的耦合降低了，因此，当底层模块位置变化的时候，我们只需要懂 router 中的依赖路径就可以了，高层模块中做了什么我们都不需要关心了。

**不足**

可以看出我们所有的依赖的模块都是在 router 模块中引入的，明显的降低了 router 模块的复杂性。我们需要一个用来专门管理注入方以及被注入方的容器，让 router 模块和往常一样轻量，没错这个东西就是 IOC。

## Inversion of Control

`Inversion of Control`简称`IOC`，即控制反转，并不是什么技术，而是一种设计模式。上面提到 DI 的不足可以使用 IOC 来解决，其实 IOC 也叫 DI。IOC 意味着将依赖模块和被依赖模块都交给容器去管理，当我们使用模块的时候，由容器动态的将它的依赖关系注入到模块中去。依据上面 DI 的思想，下面就来实现以下 IOC。

首先 IOC 中有个容器的概念，用来管理所有模块。

```js
class IOC {
  constructor() {
    this.container = new Map()
  }
}
```

我们要有一个方法，用于让我们往容器中存入模块，例如上面 Order 类，IOC 必须要有这么一个方法。

```js
const Order = require('../models/Order.js')
const OrderController = require('../controllers/OrderController.js')
ioc.bind('order', (...args) => new OrderController(new Order(...args)))
```

bind 方法用于往 IOC 容器中存放模块间的依赖，并此刻确定高层模块的依赖项。

```js
class IOC {
  constructor() {
    this.container = new Map()
  }
  bind(key, callback) {
    this.controller.set(key, { callback, single: false })
  }
}
```

上面就是 bind 方法很简单，你会发现我在容器的每一项上添加了 single 属性，这是用来标识有些类时单例的。下面来实现以下单例的写法。

```js
class IOC {
  constructor() {
    this.container = new Map()
  }
  bind(key, callback) {
    this.controller.set(key, { callback, single: false })
  }
  singleton(key, callback) {
    this.controller.set(key, { callback, single: true })
  }
}
```

当模块放入容器中的时候，我们需要用的时候怎么办呢？所以必须要有一个方法用于获取到容器中的模块。

```js
//router.js
const ioc = require('ioc')
const orderController = ioc.use('order')
```

上面通过 use 方法就可以获取到了。下面是 use 方法的实现

```js
class IOC {
  constructor() {
    this.container = new Map()
  }
  bind(key, callback) {
    this.controller.set(key, { callback, single: false })
  }
  singleton(key, callback) {
    this.controller.set(key, { callback, single: true })
  }
  use(key) {
    const item = this.controller.get(key)
    if (!item) {
      throw new Error('error')
    }
    if (item.single && !item.instance) {
      item.instance = item.callback()
    }

    return item.single ? item.instance : item.callback()
  }
}
```

上面代码就是 use 方法的实现，首先通过 key 值在容器中找到对应的模块，判断如果模块不存在则报错，然后判断是否是单例，如果是单例判断是否已经被实例化，已经实例化就不需要再进行，最后如果是单例的话返回单例实例，则执行 callback 实例化。

以上的代码完全可以做到 IOC 的功能。

## 添加小菜

运行在服务器上的代码，当我们去做测试的时候，肯定不能直接使用运行时的代码。随意我们给 IOC 添油加醋，做一个测试所用的容器。

```js
class IOC {
  constructor() {
    this.container = new Map()
    this.fakes = new Map()
  }
  bind(key, callback) {
    this.controller.set(key, { callback, single: false })
  }
  singleton(key, callback) {
    this.controller.set(key, { callback, single: true })
  }
  fake(key, callback) {
    this.fakes.set(key, { callback, single: false })
  }
  restore(key) {
    this.fakes.delete(key)
  }
  findInContainer(key) {
    if (this.fakes.has(key)) {
      return this.fakes.get(key)
    }
    return this.controller.get(key)
  }
  use(key) {
    const item = this.findInContainer(key)
    if (!item) {
      throw new Error('error')
    }
    if (item.single && !item.instance) {
      item.instance = item.callback()
    }

    return item.single ? item.instance : item.callback()
  }
}
```

上面添加了三种方法：`fake`、`restore`、`findInContainer`

1. fake 方法的作用是往测试容器中添加模块
2. restore 方法的作用是删除测试容器中的模块
3. findInContainer 的作用是统一 use 方法中生产容器和测试容器中获取模块的方法，当测试容器中存在的时候就取测试容器中的，否则取生产容器中的。(这里注意：测试容器中的模块用完即删)

最后我们通过订单类 🌰 来实践一下使用 IOC 的情况。

//首先定义一个 constants 文件用于存在所有的 key 值

```js
const TYPES = {
  order: Symbol.for('order')
}
module.exports = {
  TYPES
}
```

然后创建一个 orderIOC 文件做 IOC 的注册中心

```js
const IOC = require('ioc')
const Order = require('../models/Order.js')
const OrderController = require('../controllers/OrderController.js')
const { TYPES } = require('../constants')
const ioc = new IOC()

ioc.bind(TYPES.order, (...args) => new OrderController(new Order(...args)))

module.exports = ioc
```

在 router 文件中通过 IOC 来获取到 OrderController 类的实例,以 koa 为例

```js
const Router = require('koa-router')
const ioc = require('../ioc')
const { TYPES } = require('../constants')
const router = new Router()
const orderController = ioc.use(TYPES.order)

router.post('/create', orderController.create)

module.exports = app => app.use(router.routes()).use(router.allowedMethods())
```

## 总结

依赖耦合永远都是我们在写业务上必须要解决的问题，无论是服务端的模块化还是前端的组件化，降低依赖和让模块更稳定，更独立，实现关注点分离。非常感谢您的阅读。
