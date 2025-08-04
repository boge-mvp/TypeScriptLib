const path = require('path');

// 自定义 resolve 方法：始终使用 / 并忽略盘符
function customResolve(...args) {
  return path.resolve(...args).replace(/\\/g, "/")
}

// 创建一个代理版的 path.posix
const proxyPosixPath = {
  ...path.posix,
  resolve: customResolve,
  "testId": 1
};

// 拦截 Module._load
const originalLoad = require("module")._load;
require("module")._load = function (request, parent, isMain) {
  if (request === "path" || request === "node:path") {
    return proxyPosixPath;
  }
  return originalLoad(request, parent, isMain);
};

// 劫持 require('path')
require.cache[require.resolve('path')] = {
  id: 'path',
  exports: proxyPosixPath,
  loaded: true,
};

// 如果是 Node.js >= v16 支持 node:path
try {
  require.cache[require.resolve('node:path')] = {
    id: 'node:path',
    exports: proxyPosixPath,
    loaded: true,
  };
} catch (e) {
  console.error(e)
  // 忽略
}



console.log("monkey-path loaded")