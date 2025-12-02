const through2 = require("through2").obj

/**
 * 条件执行gulp流中的插件
 * @param condition {boolean|function} 条件，如果为true则执行插件流
 * @param plugins {Array<NodeJS.ReadWriteStream>} gulp插件数组
 * @return {NodeJS.ReadWriteStream}
 */
function ifelse(condition, plugins) {
    return through2({objectMode: true}, function (chunk, encoding, callback) {
        // 判断condition类型并计算实际的布尔值
        let result = false;
        if (typeof condition === "boolean") {
            result = condition;
        } else if (typeof condition === "function") {
            // 当condition是函数时，传递chunk和encoding参数进行判断
            result = condition.apply(this, [chunk, encoding]);
        } else {
            return callback(new Error("condition must be a boolean or function"));
        }

        // 如果条件为真且提供了插件数组，则执行这些插件
        if (result && Array.isArray(plugins) && plugins.length > 0) {
            const resultFile = []
            // 创建初始流
            let stream = through2({objectMode: true});
            stream.myName = "stream name"
            // 构建插件管道
            let pipeline = stream;
            for (let plugin of plugins) {
                if (typeof plugin === 'function') {
                    pipeline = pipeline.pipe(plugin());
                } else {
                    pipeline = pipeline.pipe(plugin);
                }
            }

            // 跟踪是否已经回调，防止多次调用callback
            let hasCallback = false;
            const safeCallback = (err, data) => {
                if (!hasCallback) {
                    hasCallback = true;
                    callback(err, data);// 完成本次处理
                }
            };

            // 监听管道的结果
            pipeline.on('data', (resultChunk) => {
                resultFile.push(resultChunk)
            });

            pipeline.on('error', (err) => {
                safeCallback(err);
            });

            // 监听结束事件，确保即使没有数据也完成回调
            pipeline.on('end', () => {
                resultFile.forEach(value => {
                    safeCallback(null, value)
                })
            });
            // 写入数据并结束流以触发处理
            stream.write(chunk);
            stream.end();
        } else {
            // 条件为假或没有插件，直接传递数据
            callback(null, chunk);
        }
    });
}

module.exports = ifelse