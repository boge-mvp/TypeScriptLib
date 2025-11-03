const gulpTs = require("gulp-typescript")
const {ProjectInfo} = require("gulp-typescript/release/project")
const {File, FileDictionary} = require("gulp-typescript/release/input")
const astDependencies = require("./ast-dependencies-parse");

/**
 * @type ProjectInfo
 */
let projectInfo

/**
 * @type Map.<File>
 */
let files

/**
 * @type FileDictionary
 */
let fileDictionary

/** @type {ts.SourceFile} */
let parseSource

/**
 *
 * @param {gulpTs.CompileStream} project
 */
function create(project) {
    projectInfo = project.project

    fileDictionary = projectInfo.input.current
    files = fileDictionary.files

    fileDictionary.getFileNames = projectFileNames
}

/**
 * 获取项目文件名列表
 *
 * 一般情况会进入两次 只有第二次才有依赖关系 source.imports
 *
 * @param {boolean} onlyGulp - 是否只返回包含gulp标记的文件
 * @returns {Array<string>} 文件名数组
 */
function projectFileNames(onlyGulp) {
    const fileNames = [];
    let fileArray = files
    if (parseSource && parseSource.imports) {
        // 分析依赖关系并对files进行排序
        fileArray = astDependencies(files);
    }
    for (const fileName in fileArray) {
        if (!files.hasOwnProperty(fileName))
            continue;
        let file = files[fileName];
        if (!parseSource) parseSource = file.ts
        if (onlyGulp && !file.gulp)
            continue;
        fileNames.push(file.fileNameOriginal);
    }
    return fileNames;
}

module.exports = create