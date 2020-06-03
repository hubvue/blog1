---
title: better-scrollv1整体设计
date: '2020-06-03'
description: 本篇文章用于分析当今最流行的滚动库better-scroll的整体设计
category: better-scroll
---

`BS`整体设计类似于`Vue`，主要分为三个阶段：
1. 代码加载完成执行
2. BS实例化
3. 运行时滚动

本篇主要写一下代码加载完成后主要做了什么

**代码加载完成执行**
在页面中`BS`滚动库加载完成之后会执行到`index.js`下的代码。
```js
import { eventMixin } from './scroll/event'
import { initMixin } from './scroll/init'
import { coreMixin } from './scroll/core'
import { snapMixin } from './scroll/snap'
import { wheelMixin } from './scroll/wheel'
import { scrollbarMixin } from './scroll/scrollbar'
import { pullDownMixin } from './scroll/pulldown'
import { pullUpMixin } from './scroll/pullup'
import { mouseWheelMixin } from './scroll/mouse-wheel'
import { zoomMixin } from './scroll/zoom'
import { infiniteMixin } from './scroll/inifinity'
import { warn } from './util/debug'

function BScroll(el, options) {
}

initMixin(BScroll)
coreMixin(BScroll)
eventMixin(BScroll)
snapMixin(BScroll)
wheelMixin(BScroll)
scrollbarMixin(BScroll)
pullDownMixin(BScroll)
pullUpMixin(BScroll)
mouseWheelMixin(BScroll)
zoomMixin(BScroll)
infiniteMixin(BScroll)
BScroll.Version = '1.15.2'
export default BScroll
```
可以看出加载完成之后会创建`BScroll`构造函数，并且执行一系列Mixin。下面主要分析三个Mixin：`initMixin`、`coreMixin`、`eventMixin`。这个三个是`BS`的核心代码，下面的一些Mixin是一些对原本BS的扩展插件(高级滚动)。

首先来看第一个`initMixin(BScroll)`，从名字可以看出是和初始化有关的。来看下里面到底做了什么。
```js
export function initMixin (BScroll) {}
    BScroll.prototype._init = function (options) {}
    BScroll.prototype.setScale = function (scale) { }
    BScroll.prototype._handleOptions = function (options) {}
    BScroll.prototype._addDOMEvents = function () {}
    BScroll.prototype._removeDOMEvents = function () { }
    BScroll.prototype._handleDOMEvents = function (eventOperation) { }
    BScroll.prototype._initExtFeatures = function () { }
    BScroll.prototype._watchTransition = function () { }
    BScroll.prototype._handleAutoBlur = function () {}
    BScroll.prototype._initDOMObserver = function () {}
    BScroll.prototype._shouldNotRefresh = function () {}
    BScroll.prototype._checkDOMUpdate = function () {}
    BScroll.prototype.handleEvent = function (e) {}
    BScroll.prototype.refresh = function () {}
    BScroll.prototype.enable = function () {}
    BScroll.prototype.disable = function () {}
}
```
在`initMixin`中对BScroll的原型绑定了一些初始化（BS实例化）的方法，以`_init`方法为入口对`BS`进行初始化。

然后来看下`coreMixin(BScroll)`。
```js
export function coreMixin(BScroll) {
  BScroll.prototype._start = function (e) { }
  BScroll.prototype._move = function (e) {}
  BScroll.prototype._end = function (e) {}
  BScroll.prototype._checkClick = function (e) {}
  BScroll.prototype._resize = function () { }
  BScroll.prototype._startProbe = function () { }
  BScroll.prototype._transitionTime = function (time = 0) { }
  BScroll.prototype._translate = function (x, y, scale) {}
  BScroll.prototype._animate = function (destX, destY, duration, easingFn) {}
  BScroll.prototype.scrollBy = function (x, y, time = 0, easing = ease.bounce) { }
  BScroll.prototype.scrollTo = function (x, y, time = 0, easing = ease.bounce, isSilent) {}
  BScroll.prototype.scrollToElement = function (el, time, offsetX, offsetY, easing) {}
  BScroll.prototype.resetPosition = function (time = 0, easeing = ease.bounce) { }
  BScroll.prototype.getComputedPosition = function () {}
  BScroll.prototype.stop = function () {}
  BScroll.prototype.destroy = function () {}
```
在`coreMixin`中同样也是向`BScorll`的原型上绑定了一些方法，这些方法用于滚动过程中的事件处理函数以及API。

`eventMixin`相当于`BS`自己实现了一套订阅发布者模式。
```js
export function eventMixin(BScroll) {}
  BScroll.prototype.once = function (type, fn, context = this) { }
  BScroll.prototype.off = function (type, fn) {}
  BScroll.prototype.trigger = function (type) {}
}
```
`BS`核心的东西就这么多，整体设计算是很清晰的。

整体流程图有空的时候再画。

![](xxxx.png)