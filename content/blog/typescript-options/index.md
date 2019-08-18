---
title: TypeScript的配置信息
date: "2019-07-15"
description: 记录TypeScript的一些配置信息
---

```json
{
  "compilerOptions": {
    /* 基础配置 */
    "incremental": true,                   /* 启动增量编译 */
    "target": "es5",                          /* 指定ECMAScript目标版本: 'ES3' (默认), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */
    "module": "commonjs",                     /* 指定生成的代码是模块化规则: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
    "lib": [],                             /* 指定要包含在编译中的库文件*/
    "allowJs": true,                       /* 是否允许编译JavaScript文件 */
    "checkJs": true,                       /* 当.js文件出错时，提示错误 */
    "jsx": "preserve",                     /* 指定jsx代码生成: 'preserve', 'react-native', or 'react'. */
    "declaration": true,                   /* 生成相应的'.d.ts' 文件. */
    "declarationMap": true,                /* 生成'.d.ts'的sourceMap文件 */
    "sourceMap": true,                     /* 生成sourceMap文件 */
    "outFile": "./",                       /* 将所有文件输出合并成单个文件 */
    "outDir": "./",                        /* 生成文件所对应的的目录*/
    "rootDir": "./",                       /* 指定输入文件的根目录 用于通过--outdir控制输出目录结构*/
    "composite": true,                     /* 启动项目编译*/
    "tsBuildInfoFile": "./",               /* 指定存储增量编译信息的文件 */
    "removeComments": true,                /* 编译输出去掉注释 */
    "noEmit": true,                        /* 编译不生成文件 */
    "importHelpers": true,                 /* 从“tslib”导入emit helpers*/
    "downlevelIteration": true,            /* 当目标为“ES5”或“ES3”时，为“for of”、“spread”和“destructing”中的iterables提供全面支持。*/
    "isolatedModules": true,               /* 将每个文件作为单独的模块 (similar to 'ts.transpileModule'). */

    /* 严格类型检查选项 */
    "strict": true,                           /* 启用所有严格的类型检查选项*/
    "noImplicitAny": true,                 /* 对具有隐含“any”类型的表达式和声明引发错误。*/
    "strictNullChecks": true,              /* 启用严格的空检查*/
    "strictFunctionTypes": true,           /* 启用对函数类型的严格检查*/
    "strictBindCallApply": true,           /* 对函数启用严格的“bind”、“call”和“apply”方法。*/
    "strictPropertyInitialization": true,  /* 启用对类中的属性初始化的严格检查 */
    "noImplicitThis": true,                /* 使用隐含的“any”类型对“this”表达式引发错误。*/
    "alwaysStrict": true,                  /* 以严格模式分析并为每个源文件发出“use strict”*/

    /* 附加的检查 */
    "noUnusedLocals": true,                /* 报告未使用的局部变量的错误*/
    "noUnusedParameters": true,            /* 报告未使用参数的错误。*/
    "noImplicitReturns": true,             /* 函数中并非所有代码路径都返回值时报告错误。*/
    "noFallthroughCasesInSwitch": true,    /* 在switch语句中报告fallthrough事例的错误*/

    /* 模块方面的配置*/
    "moduleResolution": "node",            /* 指定模块解析策略：“node”（node.js）或“classic”（typescript pre-1.6）。*/
    "baseUrl": "./",                       /* 用于解析非绝对模块名称的基目录。*/
    "paths": {},                           /* 这里应该是配置模块的alise路径*/
    "rootDirs": [],                        /* 表示运行时项目结构的根文件夹列表。*/
    "typeRoots": [],                       /* 包含类型定义的文件夹列表*/
    "types": [],                           /* 包含在编译中的类型声明文件。*/
    "allowSyntheticDefaultImports": true,  /* 允许从没有默认导出的模块中导入默认值。这不影响代码发出，只影响类型检查。*/
    "esModuleInterop": true,                   /* 通过为所有导入创建命名空间对象，实现commonjs和es模块之间的互操作性。表示“allowSyntheticDefaultImports”。 */
    "preserveSymlinks": true,              /* 不要解析符号链接的实际路径*/
    "allowUmdGlobalAccess": true,          /* 允许从模块访问UMD全局。*/

    /* Source Map 配置*/
    "sourceRoot": "",                      /* 指定调试器应在其中定位typescript文件而不是源位置. */
    "mapRoot": "",                         /* 指定调试器应定位映射文件而不是生成位置的位置。*/
    "inlineSourceMap": true,               /* 使用源映射发出单个文件，而不是使用单独的文件。*/
    // "inlineSources": true,                 /* 在单个文件中沿源映射发出源；需要设置“--inlinesourcemap”或“--sourcemap”。*/

    /* 实验性API配置 Options */
    "experimentalDecorators": true,        /* 启用对ES7装饰器的实验支持*/
    "emitDecoratorMetadata": true,         /* 启用对为装饰器发出类型元数据的实验支持*/
  }
}
```