const gulpTs = require("gulp-typescript")
const {ProjectInfo} = require("gulp-typescript/release/project")
const astDependencies = require("./ast-dependencies-parse");

/**
 *
 * @param {gulpTs.CompileStream} project
 */
function create(project) {
    /**
     * @type ProjectInfo
     */
    const projectInfo = project.project
    const fileDictionary = projectInfo.input.current
    const files = fileDictionary.files
    /** @type {ts.SourceFile} */
    let parseSource = null;

    fileDictionary.getFileNames = function projectFileNames(onlyGulp) {
        const fileNames = [];
        let fileArray = files
        if (parseSource && parseSource.imports) {
            // 分析依赖关系并对files进行排序
            fileArray = astDependencies(files);
            if (typeof astDependencies.clearCache === 'function') {
                astDependencies.clearCache();
            }
        }
        for (const fileName in fileArray) {
            if (!files.hasOwnProperty(fileName)) continue;
            let file = files[fileName];
            if (!parseSource) parseSource = file.ts
            if (onlyGulp && !file.gulp) continue;
            fileNames.push(file.fileNameOriginal);
        }
        return fileNames;
    }
}
module.exports = create