import { vec3, quat } from 'gl-matrix';

/*!
 * Contains code from google filament
 * https://github.com/google/filament/
 * License Apache-2.0
 */

const CHAR_BIT = 8;

const MAT0 = [];
const TMP0 = [];
const TMP1 = [];
const TMP2 = [];

export function packTangentFrame(q, /* vec3 */n, /* vec4 */t) {
    const c = vec3.cross(TMP0, n, t);
    const mat = toMat3(MAT0, t[0], t[1], t[2], ...c, ...n);
    q = quat.fromMat3(q, mat);
    q = quat.normalize(q, q);
    q = positive(q);

    const storageSize = 2; //sizeof(int16_t)
    // Ensure w is never 0.0
    // Bias is 2^(nb_bits - 1) - 1
    const bias = 1 / ((1 << (storageSize * CHAR_BIT - 1)) - 1);
    if (q[3] < bias) {
        q[3] = bias;
        const factor = Math.sqrt(1.0 - bias * bias);
        q[0] *= factor;
        q[1] *= factor;
        q[2] *= factor;
    }

    const b = t[3] > 0 ? vec3.cross(TMP1, t, n) : vec3.cross(TMP1, n, t);
    
    // If there's a reflection ((n x t) . b <= 0), make sure w is negative
    const cc = vec3.cross(TMP2, t, n);
    if (vec3.dot(cc, b) < 0) {
        quat.scale(q, q, -1);
    }
    return q;
}

function toMat3(out, c00, c01, c02, c10, c11, c12, c20, c21, c22) {
    out[0] = c00;
    out[1] = c01;
    out[2] = c02;

    out[3] = c10;
    out[4] = c11;
    out[5] = c12;

    out[6] = c20;
    out[7] = c21;
    out[8] = c22;

    return out;
}

const F0 = [0.0,  0.0,  1.0];
const F1 = [2.0, -2.0, -2.0];
const F2 = [2.0,  2.0, -2.0];
/**
 * Extracts the normal vector of the tangent frame encoded in the specified quaternion.
 */
function toNormal(out, q) {
    const n0 = F0;
    const n1 = vec3.scale(TMP0, F1, q[0]);
    vec3.multiply(n1, n1, vec3.set(TMP1, q[2], q[3], q[0]));
    const n2 = vec3.scale(TMP2, F2, q[1]);
    vec3.multiply(n2, n2, vec3.set(TMP1, q[3], q[2], q[1]));

    vec3.add(out, n0, n1);
    vec3.add(out, out, n2);
}

const Q0 = [1, 0, 0];
const Q1 = [-2, 2, -2];
const Q2 = [-2, 2, 2];
/**
 * Extracts the normal and tangent vectors of the tangent frame encoded in the
 * specified quaternion.
 */
export function unpackQuaternion(q, n, t) {
    toNormal(n, q);

    const t0 = Q0;
    const t1 = vec3.scale(TMP0, Q1, q[1]);
    vec3.multiply(t1, t1, vec3.set(TMP1, q[1], q[0], q[3]));
    const t2 = vec3.scale(TMP2, Q2, q[2]);
    vec3.multiply(t2, t2, vec3.set(TMP1, q[2], q[3], q[0]));

    vec3.add(t, t0, t1);
    vec3.add(t, t, t2);
}


function positive(q) {
    if (q[3] < 0) {
        return quat.scale(q, q, -1);
    } else {
        return q;
    }
}

const COUNTS = [];
export function buildNormals(positions, indices, out) {
    const normals = out || [];
    if (normals.setLength) {
        // array from arraypool
        normals.setLength(positions.length);
    } else {
        normals.length = positions.length;
    }
    const counts = COUNTS;
    if (counts.length < positions.length / 3) {
        counts.length = positions.length / 3;
    }
    counts.fill(0, 0, positions.length / 3);
    normals.fill(0, 0, positions.length);
    const len = indices.length === undefined ? indices : indices.length;//indices may be number
    for (let i = 0; i < len / 3; i++) {
        if (indices.length === undefined) {
            computeNormal(positions, i * 3, i * 3 + 1, i * 3 + 2, normals, counts);
        } else {
            computeNormal(positions, indices[i * 3], indices[i * 3 + 1], indices[i * 3 + 2], normals, counts);
        }
    }
    
    //Calculate the sum of the normal vectors of the shared faces of each vertex, then average it.
    for (let i = 0; i < normals.length; i += 3) {
        const count = counts[i / 3];
        if (count === 0) {
            continue;
        }
        normals[i] /= count;
        normals[i + 1] /= count;
        normals[i + 2] /= count;
    }
    return normals;
}

const V0 = [];
const V1 = [];
const V2 = [];

const vA = [];
const vB = [];
const vC = [];
const normal = [];
function computeNormal(vertices, v1, v2, v3, normals, counts) {
    vec3.set(vA, vertices[v1 * 3], vertices[v1 * 3 + 1], vertices[v1 * 3 + 2]);
    vec3.set(vB, vertices[v2 * 3], vertices[v2 * 3 + 1], vertices[v2 * 3 + 2]);
    vec3.set(vC, vertices[v3 * 3], vertices[v3 * 3 + 1], vertices[v3 * 3 + 2]);
    const cb = vec3.sub(V0, vC, vB);
    const ab = vec3.sub(V1, vA, vB);
    const cross = vec3.cross(V2, cb, ab);
    vec3.normalize(normal, cross);

    normals[v1 * 3] += normal[0];
    normals[v2 * 3] += normal[0];
    normals[v3 * 3] += normal[0];

    normals[v1 * 3 + 1] += normal[1];
    normals[v2 * 3 + 1] += normal[1];
    normals[v3 * 3 + 1] += normal[1];

    normals[v1 * 3 + 2] += normal[2];
    normals[v2 * 3 + 2] += normal[2];
    normals[v3 * 3 + 2] += normal[2];

    counts[v1] += 1;
    counts[v2] += 1;
    counts[v3] += 1;
}

/*!
 * Contains code from THREE.JS
 * https://github.com/mrdoob/three.js/
 * License MIT
 * 
 * Generate tangents per vertex.
 */
export function buildTangents(positions, normals, uvs, indices, out) {
    const nVertices = positions.length / 3;

    const tangents = out || new Array(4 * nVertices);

    const tan1 = [], tan2 = [];

    for (let i = 0; i < nVertices; i++) {

        tan1[ i ] = [0, 0, 0];
        tan2[ i ] = [0, 0, 0];

    }

    const vA = [0, 0, 0],
        vB = [0, 0, 0],
        vC = [0, 0, 0],

        uvA = [0, 0],
        uvB = [0, 0],
        uvC = [0, 0],

        sdir = [0, 0, 0],
        tdir = [0, 0, 0];

    function handleTriangle(a, b, c) {

        fromArray3(vA, positions, a * 3);
        fromArray3(vB, positions, b * 3);
        fromArray3(vC, positions, c * 3);

        fromArray2(uvA, uvs, a * 2);
        fromArray2(uvB, uvs, b * 2);
        fromArray2(uvC, uvs, c * 2);

        const x1 = vB[0] - vA[0];
        const x2 = vC[0] - vA[0];

        const y1 = vB[1] - vA[1];
        const y2 = vC[1] - vA[1];

        const z1 = vB[2] - vA[2];
        const z2 = vC[2] - vA[2];

        const s1 = uvB[0] - uvA[0];
        const s2 = uvC[0] - uvA[0];

        const t1 = uvB[1] - uvA[1];
        const t2 = uvC[1] - uvA[1];

        const r = 1.0 / (s1 * t2 - s2 * t1);

        vec3.set(
            sdir,
            (t2 * x1 - t1 * x2) * r,
            (t2 * y1 - t1 * y2) * r,
            (t2 * z1 - t1 * z2) * r
        );

        vec3.set(
            tdir,
            (s1 * x2 - s2 * x1) * r,
            (s1 * y2 - s2 * y1) * r,
            (s1 * z2 - s2 * z1) * r
        );

        vec3.add(tan1[ a ], tan1[ a ], sdir);
        vec3.add(tan1[ b ], tan1[ b ], sdir);
        vec3.add(tan1[ c ], tan1[ c ], sdir);

        vec3.add(tan2[ a ], tan2[ a ], tdir);
        vec3.add(tan2[ b ], tan2[ b ], tdir);
        vec3.add(tan2[ c ], tan2[ c ], tdir);

    }

    for (let j = 0, jl = indices.length; j < jl; j += 3) {

        handleTriangle(
            indices[ j + 0 ],
            indices[ j + 1 ],
            indices[ j + 2 ]
        );

    }

    const tmp = [], tmp2 = [];
    const n = [], n2 = [];
    let w, t, test;

    function handleVertex(v) {

        fromArray3(n, normals, v * 3);
        vec3.copy(n2, n);
        // n2.copy(n);

        t = tan1[ v ];

        // Gram-Schmidt orthogonalize

        vec3.copy(tmp, t);
        vec3.sub(tmp, tmp, vec3.scale(n, n, vec3.dot(n, t)));
        vec3.normalize(tmp, tmp);
        // tmp.sub(n.multiplyScalar(n.dot(t))).normalize();

        // Calculate handedness

        vec3.cross(tmp2, n2, t);
        test = vec3.dot(tmp2, tan2[ v ]);
        // tmp2.crossVectors(n2, t);
        // test = tmp2.dot(tan2[ v ]);
        w = (test < 0.0) ? -1.0 : 1.0;

        tangents[ v * 4 ] = tmp[0];
        tangents[ v * 4 + 1 ] = tmp[1];
        tangents[ v * 4 + 2 ] = tmp[2];
        tangents[ v * 4 + 3 ] = w;

    }

    for (let j = 0, jl = indices.length; j < jl; j += 3) {

        handleVertex(indices[ j + 0 ]);
        handleVertex(indices[ j + 1 ]);
        handleVertex(indices[ j + 2 ]);

    }

    return tangents;
}

function fromArray3(out, array, offset) {
    out[0] = array[offset];
    out[1] = array[offset + 1];
    out[2] = array[offset + 2];
    return out;
}

function fromArray2(out, array, offset) {
    out[0] = array[offset];
    out[1] = array[offset + 1];
    return out;
}
