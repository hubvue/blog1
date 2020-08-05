---
title: 使用tsd测试typescript类型的准确性
date: '2020-08-04'
description: 本篇文章介绍使用tsd来测试typescript中类型的准确性
category: TypeScript
---

目前大多数项目都是使用 typescript 来开发的，当我们去开发一个库或者是框架的时候，必然会输出*.d.ts 这样的文件，这里面包含项目代码的类型声明，开发者在使用的时候可以很好的做类型推断。但是我们写的类型真的是准确的吗？衡量一个框架或者库稳定的标准是这个框架或库的测试覆盖率，那么*.d.ts 作为框架或库的一部分也是需要进行测试的。

在这之前我也是一脸懵逼 o((⊙﹏⊙))o，这....还能对 ts 测试？？？通过组内同学的一顿摩擦，😯 原来是这么回事。于是就去探究一下是如何对 typescript 类型进行测试的(被逼的)。

### tsd

tsd 对外暴露了一系列测试 API，方便开发者们对 typescript 的类型进行测试。

在测试之前首先要在根目录建一个测试文件夹，先起名为`dts-test`吧，然后再`dts-test`下建立一个`index.d.ts`文件，将项目中所有的 d.ts 文件都引入进来，然后分别建立测试文件。

dts 需要知道测试目录是什么所以需要在`package.json`下配置

```json
{
  "types": "./dts-test",
  "dts": {
    "directory": "dts-test"
  }
}
```

_需要注意的是：在 dts-test 下建立测试文件的时候不要以`index.test-d.ts`或`index.test-d.tsx`命名，因为在源码里当检测到目录下有这两个文件后，其余的文件就不检测了，也就会导致其他文件下的内容不会被测试到。_

我们先`index.d.ts`中简单写一些类型，用于后面的测试。

```ts
declare type HocFunType = <T extends (...args: any[]) => any>(
  fn: T
) => (...args: Parameters<T>) => ReturnType<T>
export declare const hocFun: HocFunType
export {}
```

上面写了一个高阶函数的类型声明，由于是高阶函数最终直接结果的类型依赖于参数函数的类型，所以我们就去测试类型的准确性。

**expectType<T>(value)**

expectType 用于检测 value 的类型是否与泛型 T 的类型相同，并且是严格检测。

```ts
describe('expectType', () => {
  const add = (a: number, b: number) => a + b
  const addStr = (a: number, b: number) => String(a + b)
  expectType<(a: number, b: number) => number>(hocFun(add)) //pass
  expectType<(a: number, b: number) => string>(hocFun(addStr)) //pass
  expectType<(a: number, b: number) => number | string>(hocFun(add)) //fail
})
```

**expectNotType<T>(value)**

expectNotType 用于检测 value 的类型是否与泛型 T 的类型不同，并且是严格检测

```ts
describe('expectNotType', () => {
  const add = (a: number, b: string) => a + b
  expectNotType<(a: number, b: string) => string>(hocFun(add)) //fail
  expectNotType<(a: number, b: string) => number>(hocFun(add)) //pass
})
```

**expectAssignable<T>(value)**

expectAssignable 用于检测 value 的类型是否可分配给泛型 T

```ts
describe('expectAssignable', () => {
  const add = (a: number, b: string) => a + b
  expectAssignable<(a: number, b: string) => string>(hocFun(add)) //pass
  expectAssignable<(a: number, b: string) => string | number>(hocFun(add)) //pass
})
```

**expectNotAssignable<T>(value)**

expectNotAssignable 用户检测 value 的类型是否可分配给泛型 T，如果可分配，抛出测试错误。

```ts
describe('expectNotAssignable', () => {
  const add = (a: number, b: string) => a + b
  expectNotAssignable<(a: number, b: string) => number>(hocFun(add)) //pass
  expectNotAssignable<(a: number, b: string) => string>(hocFun(add)) //fail
  expectNotAssignable<(a: number, b: string) => string | number>(hocFun(add)) //fail
})
```

**expectError<T>(value)**

value 可以是函数也可以是值，当 value 是函数的时候检测函数的参数类型是否错误，且只有参数类型正确的时候会抛出错误；当 value 是值的时候检测 value 的类型是否和泛型 T 的类型相同，且只有当类型相同的时候回抛出错误。

```ts
describe('expectError', () => {
  const add = (a: number, b: string) => a + b
  expectError(add(1, '12')) //fail
  expectError(add(1, 2)) //pass
  expectError<string>(add(1, '123')) //fail
  expectError<number>(add(1, '123')) //pass
})
```

**expectDeprecated(value)**

expectDeprecated 用于检测该值是否标记为`@deprecated`

```ts
describe('expectDeprecated', () => {
  expectDeprecated(hocFun) //fail
})
```

**expectNotDeprecated(value)**
expectNotDeprecated 用于检测该值是否没有被标记为`@deprecated`

```ts
describe('expectNotDeprecated', () => {
  expectNotDeprecated(hocFun) //pass
})
```

### 思考 🤔

当我看完 tsd 的 API 并且实战一遍后，脑子里萌生出一个思考 🤔。d.ts 是否真的需要测试呢？对类型测试有必要吗？
其实对于一些简单的类型声明或者输出类型很明确的函数，就已经文档即测试，再进行类型测试就是在做无用功了，而对于一些复杂类型声明，比如说函数重载、类型中带有 infer 的这种类型，还是有必要测试一下，保证类型的准确性。
