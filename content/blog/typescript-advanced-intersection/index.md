---
title: TypeScript高级类型（二）：交叉类型
date: '2020-01-03'
description: TypeScript交叉类型必知必会
category: TypeScript
---

与联合类型名称一样无法理解，交叉类型表示将多种类型组合到一起，从而得到具有所需所有功能的单一类型。

例如：

```ts
interface DogInterface {
  run(): void
}
interface CatInterface {
  jump(): void
}
// 定义一个交叉类型
type Animal = DogInterface & CatInterface
let animal: Animal = {
  run() {},
  jump() {}
}
```

上面定义了两个接口类型`DogInterface`、`CatInterface`，然后定义了`Animal`交叉类型，定义`animal`的类型为`Animal`,因此 animal 这个对象必须实现两个接口类型中所有的属性和方法。

交叉类型最多的应用在`Mixin`上面，将两个对象合并成一个对象，那么结果对象的类型就是这两个对象类型的交叉类型。例如下面一段代码

```ts
function extend<T, U>(first: T, second: U): T & U {
  let result: T & U = {}
  //.....一些操作
  return result
}
```

交叉类型没有太多难点，基本上理解了名字就理解了用法，实践主要还是和其他高级类型一起来使用。
