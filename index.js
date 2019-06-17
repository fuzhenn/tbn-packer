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
        return quat.scale(q, -1);
    } else {
        return q;
    }
}
