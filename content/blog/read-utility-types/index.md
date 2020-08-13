---
title: 解读utility-types
date: '2020-08-13'
description: 本篇文章用于解读utility-types包中mapped-types文件下的高级类型实现
category: TypeScript
---

之前有系统的学过 Typescript，并且可以在项目中使用一些基本的类型定义，但是对于高级类型却一知半解，看到一些项目或者库中写的高级类型完全是懵逼的状态，于是就决定想办法去改变这种状态。忘记是哪位大神说过：`看源码是最好的学习方式`，于是就决定找个专门做 Typescript 类型的库读读源码。通过同事推荐了两个比较好的库：`utility-types`和`ts-toolbelt`,权衡下`utility-types`star 比较多并且用的也比较多，那就它吧，之后再对`ts-toolbelt`进行解读。

本篇文章主要是对`mapped-types.ts`文件中的类型进行解读。

#### SetIntersection

在 Typescript 内置的类型 API 中有个 Extract 类型，SetIntersection 类型的作用于 Extract 是相同，作用都是从类型 A 中获取可兼容类型 B 的类型，大致意思就是获取两个类型的交集。多用于联合类型。

内置的 Extract 类型的实现方式和 SetIntersection 是相同的

**实现**

```ts
type SetIntersection<A, B> = A extends B ? A : never
```

**示例**

```ts
type SetIntersectionResult = SetIntersection<'a' | 'b' | 'c', 'c' | 'b'> // 'b' | 'c'
```

上面示例结果是怎么得到的呢？我们都知道条件类型作用于联合类型上会变成分布式条件类型，结合上面示例和源码解释下：

```ts
'a' | 'b' | 'c' extends 'c' | 'b' ? 'a' | 'b' | 'c' : never =>
('a' extends 'c' | 'b' ? 'a' : never) |
('b' extends 'c' | 'b' ? 'b' : never) |
('c' extends 'c' | 'b' ? 'c' : never) =>
never | 'b' | 'c' => 'b' | 'c'
```

#### SetDifference

与 TypeScript 内置的 Exclude 类型相同，SetDifference 类型用于获取类型 A 中不可兼容类型 B 的类型
，大致意思是取类型 B 在类型 A 上的补集，多用于联合类型。

**实现**

```ts
type SetDifference<A, B> = A extends B ? never : A
```

**示例**

```ts
type SetDifferenceResult = SetDifference<'a' | 'b' | 'c', 'b'> // 'a' | 'c'
```

上面示例结果是怎么得到的呢？其实和上一个类型的运算结果大致相同，结合示例和源码解释下：

```ts
'a' | 'b' | 'c' extends 'b' ? never : 'a' | 'b' | 'c' =>
('a' extends 'b' ? never : 'a') |
('b' extends 'b' ? never : 'b') |
('c' extends 'b' ? never : 'c') =>
'a' | never | 'c' => 'a' | 'c'
```

源码里还有个类型`SetComplement`，但是实现方式和`SetDifference`相同，只是约束了泛型 B 必须为泛型 A 的子类型，具体就不分析了。

```ts
type SetComplement<A, A1 extends A> = A extends A1 ? never : A
```

#### SymmetricDifference

`SymmetricDifference`用于获取类型 A、B 的交集在并集上的补集，多用于联合类型。

**实现**

```ts
type SymmetricDifference<A, B> = SetDifference<A | B, SetIntersection<A, B>>
```

emmmm...有点绕，看个 🌰 吧

```ts
type SymmtricDifferenceResult = SymmetricDifference<
  '1' | '2' | '3',
  '2' | '3' | '4'
> // '1' | '4'
```

例子中两个类型并集为： `'1' | '2' | '3' | '4'`，交集为`'2' | '3'`，因此交集在并集上的补集为`'1' | '4'`。

是怎么做到的呢？从源码中可以看出来，我们用到了`SetDifference`和`SetIntersection`两个类型，并且这两个类型是在之前实现过的，通过组合的方式形成一个功能更加强大的类型。

源码中的解法是这样的：通过 `A|B`获取到 A、B 类型的并集，然后再通过`SetIntersection`类型获取到 A、B 类型的交集，最后再使用`SetDifference`类型求补集得出结果。

#### NonUndefined

`NonUndefined`类型用于过滤掉联合类型中的 undefined 类型。

**实现**

```ts
type NonUndefined<T> = T extends undefined ? never : T
```

源码中的实现是上面这样的，也可以使用求补集的类型。

```ts
type NonUndefined<T> = SetDifference<T, undefined>
```

**示例**

```ts
type NonUndefinedResult = NonUndefined<string | null | undefined> // string
```

看到这个结果的时候我也是很疑惑，不是只过滤掉 undefined 类型吗，怎么连 null 也过滤掉了呢？但是源码里面却没有过滤掉，瞬间怀疑自己的编辑器。经过测试在我的编辑器上 undefined 和 null 这两个类型是相互兼容的。

```ts
type undefinedToNull = undefined extends null ? 'true' : 'false' //true
type nullToUndefiend = null extends undefined ? 'true' : 'false' //true
```

目前还不太明白为什么在源码里只过滤掉了 undefined，但是在我测试的代码表现的对的。留个疑问 🤔️

#### FunctionKeys

`FunctionKeys`用于获取对象类型中值为函数的 key。

**实现**

```ts
type FunctionKeys<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? K : never
}[keyof T]
```

源码里是上面这样实现的，但是有些缺陷，在分析原理的时候再说为什么时候缺陷的。

**示例**

```ts
type MixedProps = {
  name: string
  setName: (name: string) => void
  someKeys?: string
  someFn?: (...args: any) => any
  undef: undefined
  unNull: null
}
type FunctionKeysResult = FunctionKeys<MixedProps> //"setName" | "someFn" | "undef" | "unNull"
```

咦，不应该是`"setName" | "someFn"`么，为什么多了两个呢？我们先来分析一下这个类型是怎么实现的，在分析过程中找 bug。

`FunctionKeys`接受的是一个对象类型，因此可以使用索引查询操作符遍历对象类型的每一个 key 值，遍历过程中首先通过`NonUndefined`过滤掉 undefined 类型，然后 extends Function,如何可匹配 Function 类型，那么这个 key 的值类型就是一个函数类型，但是当值类型为 undefined 或 null 的时候，会被`NonUndefined`解为 never，然而 Function 类型是兼容 never 的。所以`undef`、`unNull`就被保留了下来。

于是我在源码的基础上改了改。

```ts
type FunctionKeys<T extends object> = {
  [P in keyof T]-?: SetIntersection<NonNullable<T[P]>, Function> extends never
    ? never
    : P
}[keyof T]
```

具体思路是在遍历过程中先将值类型为 undefined、null 的 key 的值类型转为 never，然后再与 Function 取交集，也就是说将所有值类型不是函数类型的都转为 never，由于 never 类型只对自身兼容，所以再判断值类型是否兼容 never 类型，将所有的值为 never 类型的 key 过滤掉，最后再通过索引查询操作符获取到值类型的联合类型即可。

#### NonFunctionKeys

`NonFunctionKeys`用于获取对象类型中值不为函数的 key

**实现**

```ts
type NonFunctionKeys<T extends Object> = {
  [P in keyof T]-?: NonUndefined<T[P]> extends Function ? never : P
}[keyof T]
```

**示例**

```ts
type NonFunctionKeysResult = NonFunctionKeys<MixedProps> //"name" | "someKeys" | "unNull"
```

经过`FunctionKeys`类型的分析，`NonFunctionKeys`类型应该就很好理解了。

在遍历对象类型的过程中，先使用`NonUndefined`过滤掉值类型为 undefined 的 key，然后再过滤掉值类型为函数类型的 key，最后通过索引查询操作符获取到值类型的联合类型即可。

#### IfEquals

<!-- 这是一个辅助类型函数，用于判断两个类型是否相同。 -->
