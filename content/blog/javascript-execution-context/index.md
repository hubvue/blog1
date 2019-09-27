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

### 创建阶段

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

### 激活阶段

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

ES6 的到来，我感觉带来的最大的变革就是推出了块级作用域，使用 let 和 const 来定义变量来摆脱 var 变量提升带来的困惑，同样也为执行上下文增加了复杂度，不像 ES3 时期更有直观性，更加难以理解。但是，即使道路崎岖坎坷也阻挡不了探索技术深度的决心。下面来深入探究 ES6 时期的执行上下文的到底是个什么东西。

## 结构变化

ES6 的执行器上下文增加了很多东西。

```js
ExecutionContext = {
  LexicalEnvironment: {},
  VariableEnvironment: {},
  CodeEvaluationState: null,
  Function: null,
  ScriptOrModule: null,
  Realm: null,
  Generator: null
}
```

1. LexicalEnvironment：词法环境，当获取变量或者 this 值的时候使用
2. VariableEnvironment：变量环境，当生命变量时使用。
3. CodeEvaluationState：用于恢复代码执行位置
4. Function：执行的任务是函数时使用，表示正在执行的函数
5. ScriptOrModule：执行的任务是脚本或者模块时使用，表示当前正在执行的代码
6. Realm：使用的基础库和内置对象实例
7. Generator：仅生成器上下文有这个属性，表示当前生成器

以上就是目前 JavaScript 执行器上下文中的所用属性。本文以下内容仅探讨和我们代码执行有关的`LexicalEnvironment`和`VariableEnvironment`这两个。

ES6 的执行器上下文同样分为创建阶段和激活阶段两种。

### 创建阶段

创建阶段主要用于初始化词法环境和变量环境，并初始化上下文中的变量、变量声明、函数声明等等。

无论是词法环境还是变量环境中都存在三个属性：

1. EnvironmentRecord：用于存放上下文中的环境记录，就是 ES3 中的 VO
2. outer：对上层环境的引用，ES6 采用这种方式来把作用域链接成一个 outer 链条表示作用域链
3. this：this 值的绑定

EnvironmentRecord 存在两种形态：

1. Object Environment：仅在全局执行上下文中出现
2. Declarative Environment：用于存储函数声明、变量声明以及 catch 子句中的变量。仅在函数执行上下文中出现

**全局执行上下文**

```js
GlobalExecutionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      type: 'Object Environment'
    },
    outer: null,
    this: <global object>
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      type: 'Object Environment'
    },
    outer: null,
    this: <global object>
  }
}
```

**函数执行上下文**

```js
GlobalExecutionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      type: 'Declarative Environment'
    },
    outer: null,
    this: <global object>
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      type: 'Declarative Environment'
    },
    outer: null,
    this: <global object>
  }
}
```

来看下面这个 🌰

```js
let a = 20
const b = 30
var c
function multiply(e, f) {
  var g = 20
  return e * f * g
}
c = multiply(20, 30)
```

当代码执行的时候，首先创建全局执行上下文，其顺序如下：

1. 首先找 let 和 const 声明，将其变量名做为 key 值放在 LexicalEnvironment 的 EnvironmentRecode 中，值为为初始状态：uninitialized
2. 找函数声明，将函数名作为 key 值放在 LexicalEnvironment 的 EnvironmentRecord 中，值为函数体
3. 找变量声明，首先判断词法环境中是否有重名的 const let 声明，如果有的话就会报错，如果没有的话则将变量名作为 key 值放在 VariableEnvironment 的 EnvironmentRecord 下，值为 undefined

根据以上步骤，所创建的全局执行上下文，如下：

```js
GlobalExectionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // Identifier bindings go here
      a: < uninitialized >,
      b: < uninitialized >,
      multiply: < func >
    }
    outer: <null>,
    ThisBinding: <Global Object>
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // Identifier bindings go here
      c: undefined,
    }
    outer: <null>,
    ThisBinding: <Global Object>
  }
}
```

我们先跳过全局执行上下文的激活阶段，先看一下 multiply 函数的执行上下文创建状态

1. 首先创建 Arguments Object,初始化其中的值，放在 LexicalEnvironment 的 EnvironmentRecord 中
2. 一下步骤同全局执行上下文

最终 multiply 的执行上下文为：

```js
FunctionExectionContext = {
LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // Identifier bindings go here
      Arguments: {0: 20, 1: 30, length: 2},
    },
    outer: <GlobalLexicalEnvironment>,
    ThisBinding: <Global Object or undefined>,
  },
VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // Identifier bindings go here
      g: undefined
    },
    outer: <GlobalLexicalEnvironment>,
    ThisBinding: <Global Object or undefined>
  }
}
```

### 激活阶段

激活阶段逐行执行，与 ES3 的时候如出一辙。唯一需要注意的地方是，let 和 const 的声明会首先将值设置为`uninitialized`状态，如果在声明之上使用其变量就会出现暂时性死区的现象。

全局执行上下文的激活状态最终为：

```js
GlobalExectionContext = {
LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // Identifier bindings go here
      a: 20,
      b: 30,
      multiply: < func >
    }
    outer: <null>,
    ThisBinding: <Global Object>
  },
VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // Identifier bindings go here
      c: undefined,
    }
    outer: <null>,
    ThisBinding: <Global Object>
  }
}
```

multiply 函数的执行上下文的激活状态为：

```js
FunctionExectionContext = {
LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // Identifier bindings go here
      Arguments: {0: 20, 1: 30, length: 2},
    },
    outer: <GlobalLexicalEnvironment>,
    ThisBinding: <Global Object or undefined>,
  },
VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // Identifier bindings go here
      g: 20
    },
    outer: <GlobalLexicalEnvironment>,
    ThisBinding: <Global Object or undefined>
  }
}
```

## 结束语

一门语言的学习必定要学习其内部的执行机制，自我感觉明白了 JavaScript 执行上下文之后，在代码层面上更加了解执行顺序，容错率高了很多。毕竟，知己知彼，百战百胜嘛。
