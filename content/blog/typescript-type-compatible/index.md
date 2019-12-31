---
title: TypeScript类型兼容性
date: '2019-12-31'
description: 总结TypeScript的类型兼容性
category: TypeScript
---

TS 在增强 JS 类型的稳定性的同时也不失增加类型的灵活性，TS 在类型上的灵活性是通过类型兼容性一特性实现的。TS 的类型兼容性是基于结构子类型的，结构类型是一种只是用其成员来描述类型的方式，正好与名义类型形成对比(在基于名义类型的类型系统汇总，数据类型的兼容性或等价性是通过明确的声明和/或类型的名称来决定的)。

看下官网的 🌰：

```ts
interface Named {
  name: string
}
class Person {
  name: string
}
let p: Named
p = new Person()
```

在使用名义类型系统的语言中，上面代码是报错的，因为 Person 类没有明确说明其实现了 Named 接口。

TS 的结构性子类型更亲 JS 代码的书写方式，因为在 JS 中广泛的用到了函数表达式和对象字面量，所以使用结构类型系统类描述这些类型比使用名义类型系统更好。

### 类型的兼容性

当一个类型 Y 可以被赋值给另外一个类型 X 时，我们就可以说类型 X 兼容类型 Y

> 即：X 兼容 Y : X(目标类型) = Y(源类型)

例如下面 🌰：

```ts
let s: stirng = 'a'
s = null
```

上面代码我们就可以说 string 类型是兼容 null 类型的。

#### 接口兼容性

当一个接口 Y 具备另外一些接口 X 的所有属性，那么久可以认为 X 兼容 Y，即将一个 Y 类型的值赋值给 X 类型的值不会报错

```ts
interface X {
  a: any
  b: any
}
interface Y {
  a: any
  b: any
  c: any
}
let x: X = { a: 1, b: 2 }

let y: Y = { a: 1, b: 2, c: 3 }
x = y
```

> note:当接口 X 的属性集是接口 Y 的属性集的子集，那么 X 兼容 Y

#### 函数兼容性

想要两个函数类型兼容必须满足 3 个条件：

- 参数个数
- 参数类型
- 返回值类型

##### （1）参数个数

目标类型的参数个数一定要多于源类型的参数个数。

例如：

```ts
let handler1 = (a: number) = {}
let handler2 = (a: number, b:number) = {}
```

例如上面 handler1 函数有一个参数，handler 函数有两个参数，那么 handler2 是兼容 hander1 的，handler1 不兼容 handler2

```ts
handler2 = handler1 //✅
handler1 = handler2 //❌
```

当函数中存在可选参数和剩余参数时，有以下结论：

> 在参数个数满足的前提下，固定参数、可选参数、剩余参数三者是相互兼容的

为什么这么说呢？固定参数和可选参数在满足参数个数条件下就不用多说，剩余参数是可以被看做`0 - Infinite`个可选参数，满足参数个数的条件，因此也是兼容的。

#### （2）参数类型

如果想要两个函数类型兼容，那么参数类型必须要匹配

先来看一个简单类型的 🌰：

```ts
let handler1 = (a: number) => {}
let handler2 = (a: string) => {}
```

上面两个函数 handler1 和 handler2 由于参数类型不同不兼容。

```ts
handler1 = handler2 //❌
handler2 = handler1 //❌
```

再来看一个复杂类型的 🌰，如果两个函数的参数类型都是对象：

```ts
interface Point3D {
  x: number
  y: number
  z: number
}
interface Point2D {
  x: number
  y: number
}
let p3d = (point: Point3D) = {}
let p2d = (point: Point2D) = {}
p3d = p2d //✅
p2d = p3d //❌
```

上面定义了两个函数，参数分别是两个接口类型的对象，此时 p3d 是兼容 p2d 的，而 p2d 不兼容 p3d。

与接口兼容性正好相反，参数是复杂类型的函数，如果 X 函数兼容 Y 函数，那么 Y 函数的参数的属性集必定是 X 函数的参数的属性集的子集（单参）。

#### （3）返回值类型

目标函数的返回值类型必须于源函数返回值类型或者为其子类型（这里的子类型表示结构上的子集）,例如下面两个函数

```ts
let a = () => ({ name: 'Wang' })
let b = () => ({ name: 'Wang', location: 'Beijing' })
```

此时 a 函数是兼容 b 函数的，而 b 函数则不兼容 a 函数

```ts
a = b //✅
b = a //❌
```

只要满足以上三种规则，那么讲个函数类型就是相互兼容。

除此之外函数的重载也是函数类型兼容性的一种体现。例如下面这个函数重载：

```ts
function overload(a: number, b: number): number
function overload(a: string, b: string): string
function overload(a: any, b: any): any {
  console.log(a, b)
}
```

overload 函数列表中的函数为目标函数，具体实现为源函数，程序在编译时会查找重载列表，使用第一个匹配的定义来执行下面的函数，所以在重载列表中目标函数的参数要多于源函数的参数，而且返回值的类型也要符合要求。

### 枚举类型的兼容性

枚举类型的兼容性处理可以分为两点：

1. 枚举类型和数值类型是可以相互兼容的
2. 两个不同的枚举类型之间是完全不兼容的

枚举类型与数值类型

```ts
enum Fruit {
  Apple,
  Banana
}
let apple: Fruit = Fruit.Apple
let n = 123
apple = n //✅
n = apple //✅
```

枚举类型与枚举类型

```ts
enum Fruit {
  Apple,
  Banana
}
enum Colors {
  Green,
  Red
}
let apple = Fruit.Apple
let red = Colors.Red

apple = red //❌
red = apple //❌
```

### 类的兼容性

类类型的兼容性只比较结构，也就是说在比较两个类是否兼容的时候，静态成员和构造函数是不参与比较的，只比较实例成员。如果类中有私有成员，那么这个类和其他类是不兼容的，但和其子类兼容。

**没有私有成员的情况**

```ts
class A {
  constructor(a: number) {}
  id: number = 1
}
class B {
  constructor(a: number, b: number) {}
  id: number = 2
}
let a = A(1)
let b = B(1, 2)
a = b //✅
b = a //✅
```

**存在私有成员的情况**

```ts
class A {
  constructor(a: number) {}
  id: number = 1
  private name: string = 'wang'
}
class B {
  constructor(a: number, b: number) {}
  id: number = 2
}
class C extends A {}
let a = A(1)
let b = B(1, 2)
let c = C(1)
a = b //❌
b = a //❌
a = c //✅
c = a //✅
```

### 泛型兼容性

泛型兼容性中主要分为泛型接口的兼容性和泛型函数的兼容性。

**泛型接口**

定义一个泛型接口，当接口中没有使用此泛型的时候，由泛型接口定义的两个对象是兼容的；如果有使用，那么就是不兼容的。来看一下下面的 🌰。

```ts
interface Empty<T> {
  value: string
  key: string
}
```

上面定义了一个 Empty 泛型接口，但是接口内的属性并没有使用到泛型 T。

```ts
let obj1: Empty<string> = { key: 'key', value: 'value' }
let obj2: Empty<number> = { key: 'key1', value: 'value1' }
//此时两个对象是相互兼容的
obj1 = obj2 //✅
obj2 = obj1 //✅
```

如果有使用到泛型 T，例如下面这个 🌰：

```ts
interface Empty<T> {
  value: T
  key: T
}
```

上面 Empty 泛型接口中的属性都用到了泛型 T。

```ts
let obj1: Empty<string> = { key: 'key', value: 'value' }
let obj2: Empty<number> = { key: 1, value: 123 }
//此时两个对象是相互兼容的
obj1 = obj2 //❌
obj2 = obj1 //❌
```

**泛型函数**
如果两个泛型函数的定义相同，但是没有指定类型，那么这两个泛型函数是相互兼容的，否则不兼容。

```ts
let a = <T>(x: T): T => {
  console.log('x')
  return x
}
let b = <T>(y: T): T => {
  console.log('y')
  return y
}
a = b //✅
b = a //✅
```
