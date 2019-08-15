---
title: 手写一个Redux-simple
date: "2019-07-15"
description: 手写一个redux-simple
---
## 前言
`react`和状态管理`redux`是紧密结合的，而本身又没有任何联系。`react`可以不使用`redux`管理状态，`redux`也可以脱离`react`独立存在。随着`react`的项目越来越复杂，`state`变的繁重，各种`prop`和`state`的转变让我们在开发过程中变得头晕眼花，`react`本来就是一个专注于UI层的库，本不应该让繁杂的`prop`和`state`的逻辑掺杂进来。于是`Flux`的架构出现了，`Flux`架构模式用于抽离`react`的`state`能更好的去构建项目，`Flux`架构模式的实践有好多中，显然`redux`是成功的。

我在接触`react`和`redux`之前总是听好多人提起`redux`这个东西，我心想它到底有什么魔力，让那么多的人为之惊叹，今天就来揭开`redux`的真面目。

## redux
前面提到`redux`是可以脱离`react`存在的，这句话的意思是`redux`并不是依附于`react`的，即便是用`jQuery`+`redux`也是可以的。`redux`提供的是一种状态管理的方式，同时也定义了一种管理状态的规则，所有需要使用这个小而美的库的项目都必须遵循这个规则，也正是这个规则使用redux再书写过程中有了可预测性和可追溯性。

### redux的设计原则
谈`redux`必然要谈谈它的设计原则，就如同想要更明白的了解一样东西，就需要先了解它是怎么来的，当然历史明白上面这些就够了。

`redux`有三大设计原则

1. 单一数据源
2. 状态是只读的
3. 使用纯函数编写reducer

#### 1.单一数据源
单一数据源的意思是说整个`react`项目的`state`都存放在一起，也可以认为存在一个大对象中，单一数据源可以让我们在项目中更专注于数据源的设计与构建上。
#### 2.状态是只读的
使用过`redux`都知道，视图是通过`store.getState()`方法来获取状态的，通过`dispatch`派发`action`来改变状态。状态是只读的也就是说我们只能通过`stiore.getState()`来获取状态，只能通过`dispatch`派发`action`来改变状态。这也体现了单一数据流动，让我们在构建项目的时候只需要关于一个方向的数据流动。
#### 3.使用纯函数编写reducer
我当时在学的时候也是有这样的疑问：为什么要使纯函数来写，什么是纯函数？

> 所谓纯函数：对于一个函数来说相同的输入必定有相同的输出， 即不依赖外部环境，也不改变外部环境，这样的函数就叫做纯函数。纯函数纯的，是没有副作用的。

明白了纯函数，那么在写`reducer`的时候一定见过这么一段代码。
```js
const state = reducer(initstate = {},action);
```
上面代码，再结合纯函数，就可以说对于特定的`action`和`initstate`必定会得到相同的`state`，这里正是体现了`redux`的可预测性。

### redux的四个角色
`redux`提供了一系列规则来规定我们来写代码。可以大致分为四个角色：

1. action
2. reducer
3. dispatch
4. store

#### 1.action
`action`是承载状态的载体，一般`action`将视图所产出的数据，发送到reducer进行处理。`action`的书写格式一般是这样：
```js
const addAction = {
    type:"ADD",
    value:.....
}
```
`action`其实就是一个JavaScript对象，它必须要有一个type属性用来标识这个`action`是干嘛的(也可以认为家的地址，去reducer中找家)，value属性是action携带来自视图的数据。

`action`的表示方式也可以是一个函数，这样可以更方面的构建`action`,但这个函数必须返回一个对象。
```js
const addAction = (val) => ({
    type:"ADD",
    value: val
})
```
这样拿到的数据就灵活多了。

对于`action`的type属性，一般如果action变的庞大的话会把所有的type抽离出来到一个constants中，例如：
```js
const ADDTODO = 'ADDTODO',
const DELETETODO = 'DELETEDOTO'

export {
    ADDTODO,
    DELETETODO,
}
```
这样可以让type更清晰一些。

#### 2.reducer
 `reducer`指定了应用状态的变化如何响应 `actions` 并发送到 `store`。 在`redux`的设计原则中提到`使用纯函数来编写reducer`，目的是为了让state变的可预测。`reducer`的书写方式一般是这样：
 ```js
 const reducer = (state ={},action){
     switch(action.type){
         case :
            ......
         case :
            ......
         case :
            ......
         default :
            return state;
     }
 }
 ```
使用switch判断出什么样的`action`应该使用什么样的逻辑去处理。
 
##### 拆分reducer
当随着业务的增多，那么`reducer`也随着增大，显然一个`reducer`是不可能的，于是必须要拆分`reducer`，拆分`reducer`也是有一定的套路的：比如拆分一个TodoList，就可以把todos操作放在一起，把对todo无关的放在一起，最终形成一个根`reducer。`
```js
function visibilityFilter(state,action){
    switch(action.type){
        case :
            ......
        case :
            ......
        default :
            return state;
    }
}
function todos(state,action){
    switch(action.type){
        case :
            ......
        case :
            ......
        default :
            return state;
    }
}
//根reducer
function rootReducer(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action), 
    todos: todos(state.todos, action)
  }
}
```
这样做的好处在于业务逻辑的分离，让根`reducer`不再那么繁重。好在`redux`提供了`combineReducers`方法用于构建`rootReducer`
```js
const rootReducer = combineReducers({
    visibilityFilter,
    todos,
})
```
这部分代码和上面rootReducer的作用完全相同。它的原理是通过传入对象的key-value把所有的state进行一个糅合。

#### 3.dispatch
`dispatch`的作用是派发一个`action`去执行`reducer`。我觉得`dispatch`就是一个发布者，和`subscribe`一起组合成订阅发布者模式。使`dispatch`派发：
```js
const action = {
    type: "ADD",
    value: "Hello Redux",
}
dispatch(action);
```
#### 4.store
`store`可以说是`redux`的核心了。开头也提到`store`是`redux`状态管理的唯一数据源，除此之外，`store`还是将`dispatch`、`reducer`等联系起来的命脉。

`store`通过`redux`提供的`createStore`创建，它是一个对象，有如下属性：
- store.getState()  获取状态的唯一途径
- store.dispatch(action) 派发action响应reducer
- store.subscribe(handler) 监听状态的变化

创建store：
```js
const store = Redux.createStore(reducer,initialState,enhancer);
//1. reducer就是我们书写的reducer
//2. initialState是初始化状态
//3. enhancer是中间件
```
### Middleware
在创建`store`的时候`createStore`是可以传入三个参数的，第三个参数就是中间件，使用`redux`提供的`applyMiddleware`来调用，`applyMiddleware`相当于是对`dispatch`的一种增强，通过中间件可以在`dispatch`过程中做一些事情，比如打logger、thunk(异步action)等等。

使用方式如下：
```js
//异步action中间件
import thunk from "redux-thunk";
const store = Redux.createStore(reducer,initialState,applMiddleware(thunk));
```
思想先告一段落，既然懂得了`redux`的思想，那么接下来手下一个简易版的`redux`。
## 手写一个min-Redux
新的react-hooks中除了`useReducer`，集成了`redux`的功能，为什么还要深入了解`redux`呢？

随着前端技术的迭代，技术的快速更新，我们目前并没有能力去预知或者去引领前端的发展，唯一能做的就是在时代中吸收知识并消化知识，虽然未来有可能`redux`会被`useReducer`所取代，但是思想是不变的，`redux`这个小而美的库设计是奇妙的，也许有哪一天在写业务的时候遇到了某种相似的需求，我们也可以通过借助于这个库的思想去做一些事情。

### createStore
要想了解`redux`，必然要先了解它的核心，它的核心就是`createStore`这个函数，`store`、`getState`,`dispatch`都在这里产出。我个人觉得`createStore`是一个提供一系列方法的订阅发布者模式：通过`subscribe`订阅`store`的变化，通过`dispatch`派发。那么下面就来实现一下这个`createStore`。

从上面`store`中可以看出。创建一个`store`需要三个参数；
```js
//1.接受的rootReducer
//2.初始化的状态
//3.dispatch的增强器(中间件)
const createStore = (reducer,initialState,enhancer) => {
    
};
```
`createStore`还返回一些列函数接口提供调用
```js
const crateStore = (reducer, initialState, enhancer) => {
    
    return {
        getState,
        dispatch,
        subscribe,
        replaceReducer,
    }
}
```
**以下代码都是在createStore内部**
#### getState的实现
`getStore`方法的作用就是返回当前的`store`。
```js
let state = initialState;
const getState = () => {
    return state;
}
```
#### subscribe的实现
`subscribe`是`createStore`的订阅者，开发者通过这个方法订阅，当`store`改变的时候执行监听函数。`subscribe`是典型的高阶函数，它的返回值是一个函数，执行该函数移除当前监听函数。
```js
//创建一个监听时间队列
let subQueue = [];

const subscribe = (listener) => {
    //把监听函数放入到监听队列里面
    subQueue.push(listener);
    return () => {
        //找到当前监听函数的索引
        let idx = subQueue.indexOf(listener);
        if(idx > -1){
            //通过监听函数的索引把监听函数移除掉。
            subQueue.splice(idx,1);
        }
    }
}
```
#### dispatch的实现
`dispatch`是`createStore`的发布者，`dispatch`接受一个`action`，来执行`reducer`。`dispatch`在执行`reducer`的同时会执行所有的监听函数(也就是发布)。
```js
let currentReducer = reducer;
let isDispatch = false;
const dispatch = (action) => {
    //这里使用isDispatch做标示，就是说只有当上一个派发完成之后才能派发下一个
    if(isDispatch){
        throw new Error("dispatch error");
    }
    try{
        state = currentReducer(state,action);
        isDispatch = true;
    }finally{
        isDispatch = false;
    }
    
    //执行所有的监听函数
    subQueue.forEach(sub => sub.apply(null));
    return action;
}
```

#### replaceReducer
`replaceReducer`顾名思义就是替换`reducer`的意思。再执行`createState`方法的时候`reducer`就作为第一个参数传进去，如果后面想要重新换一个`reducer`，来代码写一下。

```js
const replaceReducer = (reducer) => {
    //传入一个reduce作为参数，把它赋予currentReducer就可以了。
    currentReducer = reducer;
    //更该之后会派发一次dispatch，为什么会派发等下再说。
    dispatch({type:"REPLACE"});
}
```
#### dispatch({type:"INIT"});
上面已经实现了`createStore`的四个方法，剩下的就是`replaceReducer`中莫名的派发了一个`type`为`REPLACE`的`action`，而且翻到源码的最后，也派发一个`type`为`INIT`的`action`，为什么呢？
![](https://user-gold-cdn.xitu.io/2019/5/12/16aa96082edef36b?w=433&h=68&f=png&s=13221)

其实当使用`createStore`创建`Store`的时候，我们都知道，第一个参数为`reducer`，第二个参数为初始化的`state`。当如果不写第二个参数的时候，我们再来看一下`reducer`的写法
```js
const reducer = (state = {}, action){
    switch(action.type){
        default:
            return state;
    }
}
```
一般在写`reducer`的时候都会给`state`写一个默认值，并且`default`出默认的`state`。当`createStore`不存在，这个默认值如何存储在`Store`中呢？就是这个最后派发的`type:INIT`的作用。在`replaceReducer`中派发也是这个原因，更换`reducer`后派发。
#### 完整的createStore
现在已经实现的差不多了，只要再加一些容错就可以了。
```js
/**
 * 
 * @param {*} reducer   //reducer
 * @param {*} initState    //初始状态
 * @param {*} middleware   //中间件
 */
const createStore = (reducer, initState,enhancer) => {

    let initialState;       //用于保存状态
    let currentReducer = reducer;        //reducer
    let listenerQueue = []; //存放所有的监听函数
    let isDispatch = false;

    if(initState){
        initialState = initState;
    }

    if(enhancer){
        return enhancer(createStore)(reducer,initState);
    }
    /**
     * 获取Store
     */
    const getState = () => {
        //判断是否正在派发
        if(isDispatch){
            throw new Error('dispatching...')
        }
        return initialState;
    }

    /**
     * 派发action 并触发所有的listeners
     * @param {*} action 
     */
    const dispatch = (action) => {
        //判断是否正在派发
        if(isDispatch){
            throw new Error('dispatching...')
        }
        try{
           isDispatch = true;
           initialState = currentReducer(initialState,action);
        }finally{
            isDispatch = false;
        }
        //执行所有的监听函数
        for(let listener of listenerQueue){
            listener.apply(null);
        }
    }
    /**
     * 订阅监听
     * @param {*} listener 
     */
    const subscribe = (listener) => {
        listenerQueue.push(listener);
        //移除监听
        return function unscribe(){
            let index = listenerQueue.indexOf(listener);
            let unListener = listenerQueue.splice(index,1);
            return unListener;
        }
    }

    /**
     * 替换reducer
     * @param {*} reducer 
     */
    const replaceReducer = (reducer) => {
        if(reducer){
            currentReducer = reducer;
        }
        dispatch({type:'REPLACE'});

    }
    dispatch({type:'INIT'});
    return {
        getState,
        dispatch,
        subscribe,
        replaceReducer
    }
}

export default createStore;
```
### compose
在`redux`中提供了一个组合函数，如果你知道函数式编程的话，那么对`compose`一定不陌生。如果不了解的话，那我说一个场景肯定就懂了。
```js
//有fn1，fn2，fn3这三个函数，写出一个compose函数实现一下功能
//1.  compose(fn1,fn2,fn3) 从右到左执行。
//2.  上一个执行函数的结果作为下一个执行函数的参数。
const compose = (...) => {
    
}
```
上面的需求就是`compose`函数，也是一个常考的面试题。如何实现实现一个`compose`？一步一步来。

首先`compose`接受的是一系列函数。
```js
const compose = (...fns) => {
    
}
```
从右到左执行，我们采用数组的`reduce`方法，利用惰性求值的方式。
```js
const compose = (...fns) => fns.reduce((f,g) => (...args) => f(g(args)));
```
这就是一个`compose`函数。

### 揭开中间件的秘密-applayMiddleware
`redux`中的中间件就是对`dispatch`的一种增强，在`createStore`中实现这个东西很简单。源码如下：
```js
const createStore = (reducer,state,enhancer) => {
    //判断第三个参数的存在。
    if(enhancer && type enhancer === 'function') {
        //满足enhance存在的条件，直接return，组织后面的运行。
        //通过柯里化的方式传参
        //为什么传入createStore？
            //虽然是增强，自然返回之后依然是一个store对象，所以要使用createStore做一些事情。
        //后面两个参数
            //中间件是增强，必要的reducer和state也必要通过createStore传进去。
        return enhancer(crateStore)(reducer,state);
    }
}
```
上面就是中间件再`createStore`中的实现。

中间件的构建通过`applyMiddleware`实现，来看一下`applyMiddleware`是怎么实现。由上面可以看出`applyMiddleware`是一个柯里化函数。
```js
const applyMiddleware = (crateStore) => (...args) => {
    
}
```
在`applyMiddleware`中需要执行`createStore`来得到接口方法。
```js
const applyMiddleware =(...middlewares) => (createStore) => (...args) => {
    let store = createStore(...args);
    //占位dispatch，避免在中间件过程中调用
    let dispatch = () => {
        throw new Error('error')
    }
    let midllewareAPI = {
        getState: store.getState,
        dispatch,
    }
    //把middlewareAPI传入每一个中间件中
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    //增强dispatch生成，重写占位dispatch,把store的默认dispatch传进去，
    dispatch = compose(...chain)(store.dispatch);
    
    //最后把增强的dispatch和store返回出去。
    return {
        ...store,
        dispatch
    }
}
```
上面就是`applyMiddleware`的实现方法。

#### 如何写一个中间件
根据`applyMiddleware`中间件参数的传入，可以想出一个基本的中间件是这样的：
```js
const middleware = (store) => next => action => {
    //业务逻辑
    //store是传入的middlewareAPI
    //next是store基础的dispatch
    //action是dispatch的action
}
```
这就是一个中间件的逻辑了。

#### 异步action
在写逻辑的时候必然会用到异步数据的，我们知道`reducer`是纯函数，不允许有副作用操作的，从上面到现在也可以明白整个`redux`都是函数式编程的思想，是不存在副作用的，那么异步数据怎么实现呢？必然是通过`applyMiddleware`提供的中间件接口实现了。

异步中间件必须要求`action`是一个函数，根据上面中间件的逻辑，我们来写一下。
```js
const middleware = (store) => next => action => {
    if(typeof action === 'function'){
        action(store.dispatch,store.getState);
    }
    next(action);
}
```
判断传入的`action`是否是一个函数，如果是函数使用增强`dispatch`，如果不是函数使用普通的`dispatch`。

## 总结
到此为止就是我能力范围内所理解的`Redux`。我个人认为，要学习一个东西一定要看一下它的源码，学习它的思想。技术更新迭代，思想是不变的，无非就是思想的转变。如果有不对的地方，还望大佬们指点。