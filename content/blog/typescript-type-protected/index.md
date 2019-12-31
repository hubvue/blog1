---
title: TypeScript类型保护机制
date: '2019-12-31'
description: 总结TypeScript中的类型保护机制
category: TypeScript
---

什么是类型保护机制？首先来看一段代码还原一下场景。

```ts
enum Animal {
  Dog,
  Cat
}
class Dog {
  dogSay() {
    console.log('汪汪汪')
  }
}
class Cat {
  catSay() {
    console.log('喵喵喵')
  }
}
function animalSay(animal: Animal) {
  let animal = animale === Animal.Dog ? new Dog() : new Cat()
  if (animal.dogSay) {
    animal.dogSay()
  } else {
    animal.catSay()
  }
}
```

上面代码的意思是声明一个 Dog 类和 Cat 类，然后再声明一个 animalSay 方法并且传入一个 animal 参数，animal 是一个枚举，在函数中判断 animal 是 Dog 还是 Cat 分别来执行类上面的 dogSay 或者 catSay 方法。

聪明的你看到上面代码一定知道在 TypeScript 编译器环境下时报错的。因为编译器并不知道 animal 是 Dog 的实例还是 Cat 的实例，所以在代码中使用类上的方法就会报错。

报错了，很显然就写不了代码了，那么有什么办法可以解决上面出现的问题的？问到这了那必然是有的 😬。

### 智商 250 以下能想出的办法-类型断言

类型断言是一种比较笨的办法，因为极大的增加了我们的代码量的同时类型断言也并不那么安全。

来改造一下 animalSay 函数。

```ts
function animalSay(animal: Animal) {
  let animal = animal === Animal.Dog ? new Dog() : new Cat()
  if ((animal as Dog).dogSay) {
    ;(animal as Dog).dogSay()
  } else {
    ;(animal as Cat).catSay()
  }
}
```

这样代码就不报错了，代码写错来上面提的问题也就显现出来。下面来看一种比较好的方法。

### 智商 250 以下能想出的办法-类型保护机制

什么是类型保护机制呢？TypeScript 能够在特定的区块中保证变量是属于某种特定的类型的，可以在此区块中放心的引用此类型的属性或者调用此类型的方法。

类型保护机制一共有四种方法：

- instanceof 运算符
- in 运算符
- 适用于基本类型的 typeof
- 借用类型保护函数

#### step1： instanceof 运算符

我们都知道 instanceof 是判断一个对象在另一个对象的原型链上，使用这个特定也可以用来做类型保护。修改 animalSay 函数如下：

```ts
function animalSay(animal: Animal) {
  let animal = animal === Animal.Dog ? new Dog() : new Cat()
  if (animal instanceof Dog) {
    animal.dogSay()
  } else {
    animal.catSay()
  }
}
```

#### step2：in 运算符

in 运算符的作用是判断一个属性是否存在于一个对象身上。使用 in 运算符做类型保护的话需要在 Dog 类和 Cat 类型增加一个 check 属性用来做 in 运算符的判断。修改代码如下：

```ts
class Dog {
  dogSay() {
    console.log('汪汪汪')
  }
  isDog: true
}
class Cat {
  catSay() {
    console.log('喵喵喵')
  }
  isCat: true
}
function animalSay(animal: Animal) {
  let animal = animal === Animal.Dog ? new Dog() : new Cat()
  if ('isDog' in animal) {
    animal.dogSay()
  } else {
    animal.catSay()
  }
}
```

### step3：typeof 运算符

typeof 最基本的作用是监测一个值的类型是什么（虽然监测的也不准）。
typeof 运算符并不能用于上面例子，因为都是 Object 类型，它只能作用于它能监测出来的类型上。
例如：

```ts
function log(value: string | number) {
  if (typeof value === 'number') {
    console.log(value.toFixed(2))
  } else {
    console.log(value.length)
  }
}
```

此时上面的代码就不会报错，通过 typeof 运算符当监测出 value 是 number 类型的时候使用 number 类型上面的方法，否则就是 string 类型可以使用 string 类型上的属性或方法。

#### step4：借用类型保护函数

首先我们要声明一个类型保护函数，这个类型保护函数的返回值是由类型谓词决定的一个 boolean 值。

```ts
function isDog(animal: Dog | Cat): animal is Dog {
  return (animal as Dog).dogSay !== undefined
}
```

上面类型保护判断用于判断一个 animal 参数是否是 Dog 类的实例，通过判断 animal 上 dogSay 方法是否存在来判断是否是一个 Dog 类的实例，注意返回值类型必须是一个类型谓词`is`修饰的，不然会不起作用。修改下 animalSay 函数如下：

```ts
function animalSay(animal: Animal) {
  let animal = animal === Animal.Dog ? new Dog() : new Cat()
  if (isDog(animal)) {
    animal.dogSay()
  } else {
    animal.catSay()
  }
}
```

### 总结

很显然使用类型保护机制比类型断言好多了，而且还增加了类型的安全性。通过上面四种类型保护机制的分析基本上涵盖了所有的场景，可以放心大胆的在项目中使用。
