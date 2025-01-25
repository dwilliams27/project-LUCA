# PixiJs

Will use a combination of `pixi.js` and `@pixi/react` to balance ease of development while still having a decent rendering engine. Unfortunately looks like `@pixi/react` isn't migrated to 8.x.x, so will have to use PixiJS 7.x.x which doesn't seem to support WebGPU 😭. Hopefully that's fixed soon or may need to migrate off of @pixi/react.

7.x.x also seems to need `@pixi/unsafe-eval` to work in this environment, whereas 8.x.x [may not](https://github.com/pixijs/pixijs/blob/3f4ab76e0d40ddf42192c965a46161e36af97af4/src/unsafe-eval/init.ts)?
