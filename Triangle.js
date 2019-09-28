import { vec3 } from 'gl-matrix';
export default class Triangle {
    constructor(v1, v2, v3, face) {
        this.a = face.a;
        this.b = face.b;
        this.c = face.c;
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.normal = [];
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

    computeNormal() {
        const vA = this.v1.position;
        const vB = this.v2.position;
        const vC = this.v3.position;
        const cb = vec3.sub([], vC, vB);
        const ab = vec3.sub([], vA, vB);
        const cross = vec3.cross([], cb, ab);
        vec3.normalize(this.normal, cross);
    }

    hasVertex(v) {
        return v === this.v1 || v === this.v2 || v === this.v3;
    }
}
