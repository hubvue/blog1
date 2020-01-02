---
title: TypeScript高级类型（一）：联合类型
date: '2020-01-02'
description: TypeScript联合类型必知必会
category: TypeScript
---

联合类型，应该有很多人像我一样听到这个词以为是类型的并集，很快就被打脸了，因为联合类型是或的意思。

除了一些 JavaScript 中的基本类型之外，TypeScript 中定义了许多高级类型，联合类型就是其中的一种。

那么什么是联合类型呢？

所谓联合类型就是在定义的是时候可以定义多种类型，编译器在编译的时候会取多种类型中的一种。

例如：当我们有一个`getValue`函数，接收一个参数，当这个参数是`number`类型的时候保留两位小数；当这个参数是`string`类型的时候取字符串的长度。

在不曾听说联合类型的时候代码一定是这样的。

```ts
function getValue(value: any) {
  if (typeof value === 'number') {
    return value.toFixed(2)
  } else {
    return value.length
  }
}
```

我们很容易的把 value 的类型定义成了`any`，这样并不是安全的，如果传进来的是一个`boolean`类型，那么就会报错了。

知道联合类型的你一定是这样定义的。

```ts
function getValue(value: string | number) {
  if (typeof value === 'number') {
    return value.toFixed(2)
  } else {
    return value.length
  }
}
```

使用联合类型定义了 value 的类型只能是`string`或者`number`，同时 IDE 也会友好的给出两个不同类型的代码提示(基于类型保护的基础上)。

联合类型主要分为两种：

- 类型式
- 字面量式

**类型式**

类型式是定义一个类型为联合类型，所定义值的类型只能是联合类型中的一种。

```ts
type Type = string | number | boolean
let typeString: Type = '1'
let typeNumber: Type = 1
let typeBoolean: Type = true
```

**字面量式**

字面量式联合类型主要用于限制取值。如果一个变量的类型是字面量联合类型，那么这个变量的取值只能是联合类型中的一个。

```ts
type Tag = 'a' | 'b' | 'c'
let tag: Tag
```

此时 tag 的取值只能是`a` 、`b` 、`c`。

如果联合类型用于声明对象，那么在非类型保护的情况下只能使用其对象上共有的属性。

例如：

```ts
interface DogInterface {
  run(){}
}
interface CatInterface {
  jump(){}
}
class Dog implements DogInterface {
  run(){}
  eat(){}
}
class Cat implements CatInterface {
  jump(){}
  eat(){}
}

function getPet(master: Dog | Cat) {
  master.eat();
  master.run();
}

```

上面基于`interface`定义了两个类：Dog 和 cat，在 getPet 方法中传入 master 参数，master 的类型是 Dog 和 Cat 的联合类型，函数体中调用了两个方法，聪明的你一定会发现在编译器中函数体的第一行是 ✅，第二行是 ❌ 的。因为 TypeScript 无法辨别 master 是什么类型，只能访问其共有的属性或方法。

要想正常访问使用类型保护就可以了。

```ts
function getPet(master: Dog | Cat) {
  master.eat()
  if (master instanceof Dog) {
    master.run()
  } else {
    master.jump()
  }
}
```

更多类型保护的知识请戳[这里](https://kim.cckim.cn/content/TypeScript/typescript-type-protected/)

**可区分的联合类型**

联合类型减少了 any 的使用，但也因为编译器分辨不出其变量是什么类型而抛出错误，也减少了 IDE 的代码提示。类型保护的场景有限，如何定义可区分的联合类型就必然成为关注点。

什么是可区分的联合类型呢？

如果一个类型是多个类型的联合类型，并且每个类型上都有一个共有属性且值不相同，那么就可以凭借这个共有属性创建不同的类型保护区块。当保护区块建立之后，TypeScript 编译器的类型监测及代码提示就完美上线。

例如：

```ts
interface Square {
  kind: 'square'
  size: number
}
interface Rectangle {
  kind: 'rectangle'
  width: number
  height: number
}
type Shape = Square | Rectangle

function area(s: Shape) {
  switch(s.kind) {
    case: 'square':
      return s.size * s.size
    case: 'rectangle'
     return s.height * s.width
  }
}
```

上面分别定义了`Square`和`Rectangle`的接口并且都用 kind 属性来区分，`Shape`类型是这两个接口的联合类型。

当在`area`函数中使用的时候由于使用 kind 属性区分形成了类型保护区块，所以就可以愉快的看到不同的代码提示了。

但是，如果往`Shape`联合类型上多加一个类型会怎么样呢？试一下。

```ts
interface Circle {
  kind: 'circle'
  r: number
}
type Shape = Square | Rectangle | Circle
```

加了一个`Circle`接口类型，但是 area 函数中的类型保护区块中并没有报出增加类型的错误，也就是没有检测出来。

好的办法就是在`switch`中设置`default`，default 返回一个立即执行函数，并且接口一个`never`类型作为参数。

这样当在查找`Circle`类型的时候会找到`default`中，检测参数类型并不是`Circle`类型就会抛出错误。代码如下：

```ts
function area(s: Shape) {
  switch (s.kind) {
    case 'square':
      return s.size * s.size
    case 'rectangle':
      return s.height * s.width
    case 'circle':
      return Math.PI * s.r
    default:
      return ((e: never) => {
        throw new Error(e)
      })(s)
  }
}
```
