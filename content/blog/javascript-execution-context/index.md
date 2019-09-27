---
title: 深入了解JavaScript执行上下文
date: '2019-09-27'
description: 深入JavaScript内部执行机制，了解JavaScript执行器上下文。
---

## 前言

作为一个前端 er，当我们在写 JavaScript 代码的时候，经常会被 JavaScript 中饱受诟病的特性搞的晕头转向。其变量提升、作用域、闭包等特性我们只能通过例子来摸索出特性的规律从而得出一个感觉`差不多`的结论。其实，这些特性都和 JavaScript 执行环境有关，本篇文章通过探究从古至今的 JavaScript 执行环境来彻底弄明白变量提升、作用域、闭包等的原理。

## 什么是执行期上下文？

在 JavaScript 中存在执行期上下文这个概念，它表示 JavaScript 代码的执行环境。我们都知道 JavaScript 值单线程结构的，其内部维护着一个 JavaScript 函数执行栈。当全局代码和函数代码执行的时候，JavaScript 会对其生成一个执行期上下文，并把这个执行期上下文 push 到 JavaScript 函数执行栈中，当函数执行完毕的时候 JavaScript 函数执行栈会把函数的执行器上下文弹出。

JavaScript 中的执行期上下文主要分为 3 中：

1. Global Execution Context
2. Function Execution Context
3. Eval Execution Context

本文主要以前两种常用的进行探究。

例如以下代码：

```javascript
// global exection context
var syHello = 'Hello';
function person () {
  //function execution context
  var first = 'wang', last = 'chong';
  function firstName() {
    //function execution context
    return first
  }
  function lastName() {
    //function execution context
    reutnr lase;
  }
  console.log(`${sayHello}  ${firstName()}  ${lastName()}`)
}
person()
```

上面代码中存在着两种执行器上下文，JavaScript 代码顺序执行，其函数执行栈会发生以下变化：

1. 当 JavaScript 代码整体执行的时候会把`GlobalExectionContext`push 到 JavaScript 函数执行栈中

```js
GlobalExectionContext
```

2. 当执行 person 函数的时候，会生成一个`FunctionExecutionContext`，并把它 push 到 JavaScript 函数执行栈中

```js
FunctionExecutionContext(person)
GlobalExectionContext
```

3. person 函数内部：首先执行 firstName 函数，为其生成`FunctionExecutionContext`，并把它 push 到 JavaScript 函数执行栈中

```js
FunctionExecutionContext(firstName)
FunctionExecutionContext(person)
GlobalExectionContext
```

4. 当 firstName 函数执行结束的时候，JavaScript 函数执行栈会将其对应的执行器上下文 pop 出去

```js
FunctionExecutionContext(person)
GlobalExectionContext
```

5. firstName 函数执行完毕之后，会接着执行 lastName 函数，为其生成`FunctionExecutionContext`，并 push 到 JavaScript 函数执行栈中

```js
FunctionExecutionContext(lastName)
FunctionExecutionContext(person)
GlobalExectionContext
```

6. 当 lastName 函数执行完毕之后，将其从 JavaScript 函数执行栈中弹出。

```js
FunctionExecutionContext(person)
GlobalExectionContext
```

7. person 函数执行结束，将其从 JavaScript 函数执行栈中弹出

```js
GlobalExectionContext
```

8. 整体代码执行完毕，将全局执行期上下文弹出。

这就是 JavaScript 代码的整体运行流程，那么很好奇的是，这个 ExecutionContext 到底是什么？下文就要揭开它的神秘面纱。

现在 JavaScript 已经发展到全民 ES6+的时代，在 ES6 之前和 ES6 这两个阶段，执行期上下文发生了很大的变化，其变化原因是为了要实现 ES6 中的`let const` 块级作用域特性。

## ES3

在 ES6 之前的执行上下文中的内容主要有三个部分

1. 作用域链
2. 变量对象
3. this

使用 JavaScript 对象的形式表示就是

```js
ExecutionContext = {
  scopeChain: [],
  variableObject: {},
  this: {}
}
```

当代码执行的时候执行上下文可分为两个阶段

1. 创建阶段
2. 激活阶段

**创建阶段**

所谓创建阶段就是在代码执行前为其创建执行上下文，并为其创建变量、函数、参数等：

1. 创建 scopeChain
2. 创建 variableObject，并为其初始化变量、函数、参数
3. 确定 this 的绑定

scopeChain 就是我们常说的作用域链，它是一个类似于数组的一个结构，在其中保存在当前函数的上层上下文。

variableObject 用于存放执行过程中变量和函数，变量提升就是从这里由来，

this 用来确定当前函数的 this 指向。

创建完执行上下文之后会对代码进行扫描，并发生如下情况：

1. 创建 arguments object ，并检查其中的参数，为其初始化成变量存放在 variableObject 中
2. 扫描上下文中的函数声明，对于找到的每一个函数，将其名作为 key 其函数体作为 value 存放在 variableObject 中，如果已经存在则直接覆盖。
3. 扫描上下文中的变量声明，在 variableObject 中以其变量名作为 key 创建一个属性，初始化值为 undefined(变量提升的原理)，如果在 variableObject 中已经存在，则直接忽略。

此时执行上下文的创建阶段已经完毕了，我们找一个例子来看一下

```js
function ecTest(a, b, c) {
  console.log(d)
  var d = 1
  console.log(d)
  function e() {}
  var f = function() {}
}
ecTest(1, 2, 3)
```

根据上面步骤，这部分代码生成的执行器上下文为：

```js
ExecutionContext = {
  scopeChain: [],
  variableObject: {
    arguments: { a: 1, b: 2, c: 3 },
    a: 1,
    b: 2,
    c: 3,
    d: undefined,
    f: undefined
    e: function() {}
  }
}
```

**激活阶段**
激活阶段就是代码真正执行的时候了，当执行上下文进入激活阶段的时候，会对 variableObject 生成一个引用，就是我们常说的 AO(activeObject)。执行阶段会对 AO 中的属性进行复制处理(AO === VO)。还是以创建阶段的 🌰 为例吧，代码逐行解析步骤如下：

此时执行上下文为

```js
ExecutionContext = {
  scopeChain: [],
  variableObject: {
    arguments: { a: 1, b: 2, c: 3 },
    a: 1,
    b: 2,
    c: 3,
    d: undefined,
    f: undefined
    e: function() {}
  }
}
```

1. 执行 console.log(d),输出 undefined
2. 执行 var d = 1，由于已经提升，声明忽略，执行 d = 1

```js
ExecutionContext = {
  scopeChain: [],
  variableObject: {
    arguments: { a: 1, b: 2, c: 3 },
    a: 1,
    b: 2,
    c: 3,
    d: 1,
    f: undefined
    e: function() {}
  }
}
```

3. 执行 console.log(1)， 输出 1
4. function e() {} 已经提升，忽略
5. var f = function() {} 变量提升，声明忽略，执行 f = function(){}

```js
ExecutionContext = {
  scopeChain: [],
  variableObject: {
    arguments: { a: 1, b: 2, c: 3 },
    a: 1,
    b: 2,
    c: 3,
    d: 1,
    f: function() {},
    e: function() {}
  }
}
```

6. 执行完毕

这就是激活阶段的过程。

### 小结

以上是执行上下文在 ES3 中的具体表现，如果你对 ES6 的一些特性(let const 暂时性死区，generator)有了解的话，一定会觉得以上的东西解释不了 ES6。在 ES6 到来的时候，整体执行上下文做了更新，使用词法环境和变量环境来分别存放上下文中的变量。

## ES6
