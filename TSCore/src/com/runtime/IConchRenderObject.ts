export interface IConchRenderObject {

    drawSubmesh(submesh: any, drawType: number, renderMode: number, offset: number, count: number): void

    matrix(matrix: Float32Array): void

    boundingBox(min: Float32Array, max: Float32Array): void

}