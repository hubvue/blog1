---
title: TypeScript高级类型（四）：映射类型
date: '2020-01-06'
description: TypeScript映射类型必知必会
category: TypeScript
---

所谓映射类型就是从一个旧的类型上生成一个新的类型。

例如下面这个例子：

```ts
interface Obj1 {
  a: string
  b: boolean
  c: number
}

interface Obj2 {
  readonly a: string
  readonly b: boolean
  readonly c: number
}
```

上面代码是两个泛型，已知的是 Obj1，当我想得到 Obj2 的时候就可以使用映射类型。

首先先定义一个 readonly 的映射类型。

```ts
type Readobly<T> = {
  readonly [U in keyof T]: T[U]
}
type Obj2 = Readobly<Obj1>
```

上面代码使用索引类型的类似于遍历出泛型 T 上的所有属性，将这些属性都加上`readonly`修饰符。

实际上 Readonly 已经在 TypeScript 的`lib.es5.d.ts`中内置了，并且还有很多内置映射类型。下面来分析一下

**Partial**

`Partial`的作用是将对象类型中所有属性都映射为可选的，源码如下：

```ts
type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

`Partial`的原理如上面代码可见，使用索引类型分别为每一个属性增加`?`变为可选的。

**Required**

`Required`的作用是将对象类型中所有属性都映射为必选的，源码如下：

```ts
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

代码逻辑与`Partial`类似只是去掉了`?`

**Readonly**

`Readonly`的作用是将对象类型中所有属性都映射为只读的，源码如下：

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

代码逻辑与上面类似只是将每一个属性前面加上了 readonly。

**Pick**

`Pick`接口两个类型，第一个类型是目标类型，第二个是目标类型所有属性的联合类型的子集，作用是将目标类型只保留联合类型中存在的属性，过滤掉不存在的属性。源码如下：

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

使用泛型约束约束到 K 必须是泛型 T 的索引类型的子集，遍历所有在泛型 K 上的属性，并赋予相应的类型。

前面这些映射类型都是作用在目标类型身上的称为同态，下面这个并不是作用在目标类型身上的。

**Record**

`Record`同样接收两个类型，第一个类型必须是`string | number | symbol`三个类型中的一种或者是三者的联合类型，第二个类型是任意类型，作用是生成一个对象类型，对象类型的 key 的类型由第一个类型定义，value 的类型由第二个类型定义。源码如下：

```ts
type Record<K extends keyof any, T> = {
  [P in K]: T
}
```

`Record`的第一个参数类型使用类型约束到 any 的索引类型，因此`K`的类型如上面说的，然后遍历 K 泛型的每一项，将对应的 value 的类型设置为`T`。
