---
title: TypeScript高级类型（三）：索引类型
date: '2020-01-06'
description: TypeScript索引类型必知必会
category: TypeScript
---

索引类型可以把一个对象类型的所有公共的 key 联合起来形成联合类型。首先介绍一下与索引类型有关的一些知识。

**keyof 关键字**

`keyof`关键字是索引类型的查询操作符。索引类型主要通过 `keyof` 关键字来声明，它作用于一个对象类型。来看下面 🌰：

```ts
interface Obj {
  a: number
  b: number
}
let keys: keyof Obj
```

此时`keys`的的类型是 Obj 属性的联合类型，也就是`'a' | 'b'`，所以说`keys`的值只能是`'a' | 'b'`这两个。

**T[K]**

`T[K]`这种形式是索引访问操作符，表示对象 T 的属性 K 所代表的的类型。就拿上面的 Obj 接口来说，例如：

```ts
let value: Obj['a']
```

此时`value`的类型就是 `number` 类型。

那么它们有什么用呢？

来看下面一段代码

```ts
let obj = {
  a: 1,
  b: 2,
  c: 3
}
function getValues(obj: any, keys: string[]) {
  return keys.map(key => obj[key])
}
```

上面写了一个`getValues`函数，传进去一个对象和一个 string 数组，所用是拿到 keys 的 item 作为 obj 的 key 的 value 值。

当我们开始使用的时候。

```ts
getValues(obj, ['a', 'b'])
getValues(obj, ['e', 'f'])
```

我们会发现`e`和`f`都不是`obj`上的属性传进去没有被警告，TypeScript 本身就是为我们提供严格的类型约束，这种现象是不能忍受的，此时的解决办法就可以用到索引类型。

下面是我用索引类型约束好的代码。

```ts
function getValues<T, K extends keyof T>(obj: T, keys: K[]): T[K][] {
  return keys.map(key => obj[key])
}
```

代码中使用了泛型约束`K extends keyof T`，意思是 K 泛型只能取`T`泛型的所用公共属性的`key`作为类型。其返回值是在`obj`中所查询到的值因此使用索引访问操作符来约束返回值类型数组。

此时我们再调用`getValues`函数就会对没有的属性进行约束。

```ts
getValues(obj111, ['a', 'b']) //✅
getValues(obj111, ['e', 'f']) //❌
```
