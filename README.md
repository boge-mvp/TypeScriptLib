# TypeScriptLib

TypeScript common lib    ( Laya 、 Fairygui)


### npm使用方式 ###
在package.json 文件中添加命令

```json
{
  "dependencies": {
    "game-lib": "git+ssh://github.com/用户名/仓库名.git#37d5336"
  }
}
```
更新
添加新的tag 在执行 
````
npm update game-lib
````

```json
{
  "dependencies": {
    "game-lib": "git+ssh://github.com/用户名/仓库名.git#semver:1.0.2"
  }
}
```


### 使用gitee仓库 ###


在npm中使用gitee仓库的地址进行安装，例如：
````
{
"dependencies": {
"模板名称": "git+https://gitee.com/用户名/仓库名.git#标签版本号"
或ssh
"模板名称": "git+ssh://git@gitee.com:用户名/仓库名.git#semver:标签版本号"
}
````

如果您的gitee仓库中包含特定版本的代码，您可以在安装时指定版本号，例如：

````npm
npm install username/repository#版本号
````
其中，"版本号"是您想要安装的代码版本号。

例子
````
npm install -g git@gitee.com:bogegit/TypeScriptLib.git#46db9be3
````