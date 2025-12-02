const rollup = require('rollup')
const log = require("gulplog")
const streamNode = require("stream")
const through2 = require("through2")
const File = require('vinyl');

/**
 * 配合gulp pipe 流执行，必须有返回非 undefined 的值 否则阻塞
 * @param func {function(chunk: Buffer | File, encoding: string, callback: function(Error|null, chunk: Buffer)): boolean}
 *        返回值不是 undefined 将会立即执行流传递，否则等待调用 callback
 * @param [end=null] {function(): void} 回调执行结束的方法，需要回调否则会阻塞
 * @param args {any} 附带的参数 会放在开头
 */
function runStream(func, end, ...args) {
    return through2.obj(function (chunk, encoding, callback) {
        if (func) {
            try {
                let result = func.apply(this, [...args, chunk, encoding, callback])
                if (result !== undefined)
                    callback(null, chunk)
            } catch (e) {
                callback(e)
            }
        } else callback(null, chunk)
    }, end)
}

/**
 * 运行一次流处理 function中不要执行异步数据处理，否则执行顺序会混乱
 * @param func {({chunk},{enc})=>{}} 处理方法
 * @param [end=null] {function(()=>{}):{}} 回调流 参数方法需要回调不然会阻塞
 * @param args {any} 附带的参数  会放在开头
 * @return {*}
 */
function run(func, end, ...args) {
    return through2.obj(function (chunk, encoding, callback) {
        try {
            func && func.apply(this, [...args, chunk, encoding])
            callback(null, chunk)
        } catch (e) {
            callback(e)
        }
    }, end)
}

/**
 * 创建一个 Rollup 构建流，用于处理多个构建选项并生成对应的文件流
 * @param {...rollup.RollupOptions} options - Rollup 构建选项数组，每个选项包含输入和输出配置
 * @returns {streamNode.Readable} 返回一个可读流，包含构建生成的文件
 */
function rollupStream(...options) {
    const build = async (options, stream) => {
        const bundle = await rollup.rollup(options);
        stream.emit('bundle', bundle);
        let outputOpt = options.output
        if (!Array.isArray(outputOpt)) {
            outputOpt = [outputOpt]
        }
        // 遍历每个 output 配置
        for (const outputOptions of outputOpt) {
            const {output} = await bundle.generate(outputOptions);
            for (const chunk of output) {
                let fileName = chunk.fileName;
                const type = chunk.type
                // 处理 chunk 类型（JS）
                if (type === 'chunk') {
                    let content = chunk.code
                    const file = new File({
                        contents: Buffer.from(content),
                        path: fileName
                    });
                    result.push(file);
                } else if (type === 'asset') {
                    const source = chunk.source
                    const file = new File({
                        path: fileName,
                        contents: Buffer.from(source),
                    });
                    result.push(file);
                } else {
                    log.warn("Unknown type : " + type)
                }
            }
        }

    };

    const create = async (options, stream) => {
        for (const option of options) {
            await build(option, result)
        }
        stream.push(null); // 结束流
    }
    const result = new streamNode.Readable({
        objectMode: true, // 默认只能是 string Buffer
        read: () => {
        }
    });
    create(options, result).catch((error) => {
        result.emit('error', error);
    });
    return result;
}

module.exports = {
    rollupStream, runStream, run
}