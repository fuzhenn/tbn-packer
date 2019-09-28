export default class Vertex {
    constructor(vertices, index) {
        this.position = vertices;
        this.index = index; //index of vertex
        this.faces = []; // face shared
        this.neighbors = []; // neighbor vertexes
    }

    addUniqueNeighbor(vertex) {
        if (this.neighbors.indexOf(vertex) === -1) {
            this.neighbors.push(vertex);
        }
    }
}