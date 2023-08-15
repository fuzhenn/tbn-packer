export default class Vertex {
    constructor(vertices, index) {
        this.position = vertices;
        this.index = index; //index of vertex
        this.faces = []; // face shared
        this.neighbors = []; // neighbor vertexes
    }

    set(x, y, z, index) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.index = index;
        this.neighbors = [];
        this.faces = [];
    }

    addUniqueNeighbor(vertex) {
        if (this.neighbors.indexOf(vertex) === -1) {
            this.neighbors.push(vertex);
        }
    }
}