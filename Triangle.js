import { vec3 } from 'gl-matrix';

const V0 = [];
const V1 = [];
const V2 = [];
export default class Triangle {
    constructor(vertices, a, b, c) {
        this.normal = [];
        this.set(vertices, a, b, c);
    }

    computeNormal() {
        const vA = this.v1.position;
        const vB = this.v2.position;
        const vC = this.v3.position;
        const cb = vec3.sub(V0, vC, vB);
        const ab = vec3.sub(V1, vA, vB);
        const cross = vec3.cross(V2, cb, ab);
        vec3.normalize(this.normal, cross);
    }

    hasVertex(v) {
        return v === this.v1 || v === this.v2 || v === this.v3;
    }

    set(vertices, a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
        const v1 = this.v1 = vertices[a];
        const v2 = this.v2 = vertices[b];
        const v3 = this.v3 = vertices[c];

        this.computeNormal();
        //add self into v1 vertex as its shared face
        v1.faces.push(this);
        v1.addUniqueNeighbor(v2);
        v1.addUniqueNeighbor(v3);

        v2.faces.push(this);
        v2.addUniqueNeighbor(v1);
        v2.addUniqueNeighbor(v3);

        v3.faces.push(this);
        v3.addUniqueNeighbor(v1);
        v3.addUniqueNeighbor(v2);
    }
}
