import { packTangentFrame, unpackQuaternion } from "./index.js";
import assert from 'assert';

describe('specs', () => {
    it('spec0', () => {
        const tangent = [1, 0, 0, 1];
        const normal = [0, 1, 0];

        const q = [];
        packTangentFrame(q, tangent, normal);
        const n = [], t = [];
        unpackQuaternion(q, n, t);

        assert.deepEqual(q, [-0.7071067811865475, 0, 0, 0.7071067811865476]);
        assert.deepEqual(n, [0, 1, 2.220446049250313e-16]);
        assert.deepEqual(t, [1, 0, 0]);
    });

    it('spec1', () => {
        const normal = [0, 0, 1];
        const tangent = [0.9782581925392151, -0.20739074051380157, 0, 1];

        const q = [];
        packTangentFrame(q, tangent, normal);
        const n = [], t = [];
        unpackQuaternion(q, n, t);
        assert.deepEqual(q, [0, 0, -0.1042636387271766, 0.9945496939014002]);
        assert.deepEqual(n, [0, 0, 1]);
        assert.deepEqual(t, [0.9782581872787376, -0.20739073996231935, 0]);
    });
});
