# tbn-packer
[![Circle CI](https://circleci.com/gh/fuzhenn/tbn-packer.svg?style=shield)](https://circleci.com/gh/fuzhenn/tbn-packer)

Pack tangent and normal data into a quaternion, a useful [tech published by crytek](http://www.crytek.com/download/izfrey_siggraph2011.pdf) to compress data push to GPU.

This is converted from C++ implementation of [google filament](https://github.com/google/filament).

## Usage

```js
import { packTangentFrame, unpackQuaternion } from "@maptalks/tbn-packer";
const tangent = [1, 0, 0, 1];
const normal = [0, 1, 0];

const q = [];
//pack tangent and normal to a quaternion
packTangentFrame(q, tangent, normal);
const n = [], t = [];
//unpack a given quaternion to a normal and tangent.
unpackQuaternion(q, n, t);
```

### GLSL Code to unpack

From google filament:

```glsl
/**
 * Extracts the normal vector of the tangent frame encoded in the specified quaternion.
 */
void toTangentFrame(const highp vec4 q, out highp vec3 n) {
    n = vec3( 0.0,  0.0,  1.0) +
        vec3( 2.0, -2.0, -2.0) * q.x * q.zwx +
        vec3( 2.0,  2.0, -2.0) * q.y * q.wzy;
}

/**
 * Extracts the normal and tangent vectors of the tangent frame encoded in the
 * specified quaternion.
 */
void toTangentFrame(const highp vec4 q, out highp vec3 n, out highp vec3 t) {
    toTangentFrame(q, n);
    t = vec3( 1.0,  0.0,  0.0) +
        vec3(-2.0,  2.0, -2.0) * q.y * q.yxw +
        vec3(-2.0,  2.0,  2.0) * q.z * q.zwx;
}
```

## Install

```shell
npm i @maptalks/tbn-packer
```

### Test
```shell
npm test
```
