import { vec3, quat } from 'gl-matrix';

/*!
 * Contains code from google filament
 * https://github.com/google/filament/
 * License Apache-2.0
 */

const CHAR_BIT = 8;

export function packTangentFrame(q, /* vec4 */t, /* vec3 */n) {
    const c = vec3.cross([], n, t);
    const mat = [t[0], t[1], t[2], ...c, ...n];
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

    const b = t[3] > 0 ? vec3.cross([], t, n) : vec3.cross([], n, t);
    
    // If there's a reflection ((n x t) . b <= 0), make sure w is negative
    const cc = vec3.cross([], t, n);
    if (vec3.dot(cc, b) < 0) {
        quat.scale(q, q, -1);
    }
    return q;
}

const A = [0.0,  0.0,  1.0];
const B = [2.0, -2.0, -2.0];
const C = [];
const D = [2.0,  2.0, -2.0];
const E = [];
const N1= [];
const N2 = [];
/**
 * Extracts the normal vector of the tangent frame encoded in the specified quaternion.
 */
function toNormal(out, q) {
    const n0 = A;
    const n1 = vec3.scale(N1, B, q[0]);
    vec3.multiply(n1, n1, vec3.set(C, q[2], q[3], q[0]));
    const n2 = vec3.scale(N2, D, q[1]);
    vec3.multiply(n2, n2, vec3.set(E, q[3], q[2], q[1]));

    vec3.add(out, n0, n1);
    vec3.add(out, out, n2);
}

const AA = [1, 0, 0];
const BB = [-2, 2, -2];
const CC = [];
const DD = [-2, 2, 2];
const EE = [];
const T1 = [], T2 = [];
/**
 * Extracts the normal and tangent vectors of the tangent frame encoded in the
 * specified quaternion.
 */
export function unpackQuaternion(q, n, t) {
    toNormal(n, q);

    const t0 = AA;
    const t1 = vec3.scale(T1, BB, q[1]);
    vec3.multiply(t1, t1, vec3.set(CC, q[1], q[0], q[3]));
    const t2 = vec3.scale(T2, DD, q[2]);
    vec3.multiply(t2, t2, vec3.set(EE, q[2], q[3], q[0]));

    const tangent = vec3.add([], t0, t1);
    vec3.add(tangent, tangent, t2);

    vec3.copy(t, tangent);
}


function positive(q) {
    if (q[3] < 0) {
        return quat.scale(q, -1);
    } else {
        return q;
    }
}
