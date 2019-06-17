import { packTangentFrame, unpackQuaternion } from "./index.js";
import assert from 'assert';

describe('specs', () => {
    it('spec0', () => {
        const tangent = [1, 0, 0, 1];
        const normal = [0, 1, 0];

        const q = [];
        packTangentFrame(q, normal, tangent);
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
        packTangentFrame(q, normal, tangent);
        const n = [], t = [];
        unpackQuaternion(q, n, t);
        assert.deepEqual(q, [0, 0, -0.1042636387271766, 0.9945496939014002]);
        assert.deepEqual(n, [0, 0, 1]);
        assert.deepEqual(t, [0.9782581872787376, -0.20739073996231935, 0]);
    });

    it('spec with negative w', () => {
        const normal = [-0.7194613218307495, 0.09259603917598724, -0.6883323192596436];
        const tangent = [0.6883996426554599, -0.036342485483755425, -0.7244205655147415,-1];

        const q = [];
        packTangentFrame(q, normal, tangent);
        const n = [], t = [];
        unpackQuaternion(q, n, t);
        assert.deepEqual(q, [0.9181193087795059,-0.03497276077906349,-0.3931629236205514,-0.03545075936948719]);
        assert.deepEqual(n, [-0.7194613214907302, 0.09259603912600184, -0.6883323183005344]);
        assert.deepEqual(t, [0.6883996429872618, -0.0363424855086171, -0.724420565198191]);
    });
});
