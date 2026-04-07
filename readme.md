<h1 align="center">
  builtin-type
</h1>

<div align="center">
  <a href="https://npmjs.org/package/builtin-type">
    <img src="https://badgen.net/npm/v/builtin-type" alt="version" />
  </a>
  <a href="https://github.com/TomerAberbach/builtin-type/actions">
    <img src="https://github.com/TomerAberbach/builtin-type/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://unpkg.com/builtin-type/dist/index.js">
    <img src="https://deno.bundlejs.com/?q=builtin-type&badge" alt="gzip size" />
  </a>
  <a href="https://unpkg.com/builtin-type/dist/index.js">
    <img src="https://deno.bundlejs.com/?q=builtin-type&config={%22compression%22:{%22type%22:%22brotli%22}}&badge" alt="brotli size" />
  </a>
  <a href="https://github.com/sponsors/TomerAberbach">
    <img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Sponsor" />
  </a>
</div>

<div align="center">
  What is the type of this builtin JS value?
</div>

## Features

- **Comprehensive:** Supports a ton of builtin types
- **Robust:** Works
  [cross-realm](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof#instanceof_and_multiple_realms)
- **Secure:** Resilient to spoofing
- **Tiny:** One 0.92 kB gzipped package instead of
  [`which-builtin-type`'s 10.5 kB gzipped total size](https://bundlejs.com/?q=which-builtin-type%401.2.1)
  with [50 dependencies](https://npmgraph.js.org/?q=which-builtin-type#zoom=w)

## Install

> [!NOTE]
>
> Determining the builtin type in a way that works cross-realm and is resilient
> to spoofing is significantly slower than plain
> [`instanceof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
> or
> [`Object.prototype.toString.call(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString#using_tostring_to_detect_object_class).
> If you don't need those guarantees, then just use these simpler options
> directly.

```sh
$ npm i builtin-type
```

## Usage

<!-- eslint-disable require-unicode-regexp, prefer-regex-literals, no-new-wrappers, unicorn/new-for-builtins, symbol-description, prefer-rest-params -->

```js
import assert from 'node:assert'
import builtinType from 'builtin-type'

assert.equal(builtinType(undefined), `undefined`)
assert.equal(builtinType(null), `null`)
assert.equal(builtinType(false), `boolean`)
assert.equal(builtinType(42), `number`)
assert.equal(builtinType(42n), `bigint`)
assert.equal(builtinType(`foo`), `string`)
assert.equal(builtinType(Symbol()), `symbol`)
assert.equal(builtinType(new Boolean(false)), `Boolean`)
assert.equal(builtinType(new Number(42)), `Number`)
assert.equal(builtinType(Object(42n)), `BigInt`)
assert.equal(builtinType(new String(`foo`)), `String`)
assert.equal(builtinType(Object(Symbol())), `Symbol`)
assert.equal(builtinType([]), `Array`)
assert.equal(builtinType(new Map()), `Map`)
assert.equal(builtinType(new Set()), `Set`)
assert.equal(builtinType(new WeakMap()), `WeakMap`)
assert.equal(builtinType(new WeakSet()), `WeakSet`)
assert.equal(
  builtinType(() => {}),
  `Function`,
)
assert.equal(
  builtinType(function* () {}),
  `GeneratorFunction`,
)
assert.equal(
  builtinType(async () => {}),
  `AsyncFunction`,
)
assert.equal(
  builtinType(async function* () {}),
  `AsyncGeneratorFunction`,
)
assert.equal(
  builtinType(
    (function () {
      return arguments
    })(),
  ),
  `Arguments`,
)
assert.equal(builtinType(Promise.resolve()), `Promise`)
assert.equal(builtinType(new Date()), `Date`)
assert.equal(builtinType(/a/g), `RegExp`)
assert.equal(builtinType(new URL(`https://example.com/`)), `URL`)
assert.equal(builtinType(new URLSearchParams()), `URLSearchParams`)
assert.equal(builtinType(new WeakRef({})), `WeakRef`)
assert.equal(
  builtinType(new FinalizationRegistry(() => {})),
  `FinalizationRegistry`,
)
assert.equal(builtinType(new ArrayBuffer()), `ArrayBuffer`)
assert.equal(builtinType(new SharedArrayBuffer()), `SharedArrayBuffer`)
assert.equal(builtinType(Buffer.from([])), `Buffer`)
assert.equal(builtinType(new Int8Array()), `Int8Array`)
assert.equal(builtinType(new Uint8Array()), `Uint8Array`)
assert.equal(builtinType(new Uint8ClampedArray()), `Uint8ClampedArray`)
assert.equal(builtinType(new Int16Array()), `Int16Array`)
assert.equal(builtinType(new Uint16Array()), `Uint16Array`)
assert.equal(builtinType(new Int32Array()), `Int32Array`)
assert.equal(builtinType(new Uint32Array()), `Uint32Array`)
assert.equal(builtinType(new BigInt64Array()), `BigInt64Array`)
assert.equal(builtinType(new BigUint64Array()), `BigUint64Array`)
assert.equal(builtinType(new Float16Array()), `Float16Array`)
assert.equal(builtinType(new Float32Array()), `Float32Array`)
assert.equal(builtinType(new Float64Array()), `Float64Array`)
assert.equal(builtinType(new DataView(new ArrayBuffer())), `DataView`)
assert.equal(builtinType(new Temporal.Duration()), `Temporal.Duration`)
assert.equal(
  builtinType(Temporal.Instant.fromEpochMilliseconds(0)),
  `Temporal.Instant`,
)
assert.equal(
  builtinType(new Temporal.PlainDate(2024, 1, 15)),
  `Temporal.PlainDate`,
)
assert.equal(
  builtinType(new Temporal.PlainDateTime(2024, 1, 15, 12)),
  `Temporal.PlainDateTime`,
)
assert.equal(
  builtinType(new Temporal.PlainMonthDay(1, 15)),
  `Temporal.PlainMonthDay`,
)
assert.equal(builtinType(new Temporal.PlainTime(12)), `Temporal.PlainTime`)
assert.equal(
  builtinType(new Temporal.PlainYearMonth(2024, 1)),
  `Temporal.PlainYearMonth`,
)
assert.equal(
  builtinType(new Temporal.ZonedDateTime(0n, `UTC`)),
  `Temporal.ZonedDateTime`,
)
assert.equal(builtinType({}), `Object`)
```

## Benchmarks

`builtin-type` is around 1.45x faster than
[`which-builtin-type`](https://www.npmjs.com/package/which-builtin-type) for a
diverse set of 500 values.

Here's an example run of [the benchmark](./src/index.bench.ts):

```
 ✓ src/index.bench.ts 3069ms
     name                   hz      min      max     mean      p75      p99     p995     p999     rme  samples
   · whichBuiltinType  66.2924  14.9159  15.6526  15.0847  15.1303  15.6526  15.6526  15.6526  ±0.39%       34
   · builtinType       96.9832   9.9813  10.8347  10.3111  10.3934  10.8347  10.8347  10.8347  ±0.60%       49
```

## Contributing

Stars are always welcome!

For bugs and feature requests,
[please create an issue](https://github.com/TomerAberbach/builtin-type/issues/new).

## License

[MIT](https://github.com/TomerAberbach/builtin-type/blob/main/license) ©
[Tomer Aberbach](https://github.com/TomerAberbach)
