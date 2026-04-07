/* eslint-disable unicorn/error-message */
/* eslint-disable unicorn/new-for-builtins */
/* eslint-disable no-new-wrappers */
/* eslint-disable require-unicode-regexp */

import { runInNewContext } from 'node:vm'
import { fc, test } from '@fast-check/vitest'
import { expect, it } from 'vitest'
import whichBuiltinType from 'which-builtin-type'
import builtinType from './index.ts'
import type { BuiltinType } from './index.ts'

const withToStringTag = (values: unknown[]): unknown[] =>
  values
    .filter(isObject)
    .map(value =>
      Object.defineProperty(value, Symbol.toStringTag, { value: `LIES!` }),
    )

const withObjectPrototype = (values: unknown[]): unknown[] =>
  values
    .filter(
      (value): value is object =>
        isObject(value) && typeof value !== `function`,
    )
    .map(value => Object.assign(value, { constructor: Object }))

const fromDifferentRealm = (values: () => unknown[]): unknown[] =>
  runInNewContext(`(${values.toString()})()`, {
    URL,
    URLSearchParams,
    Buffer,
    Temporal,
  }) as unknown[]

const isObject = (value: unknown): value is object =>
  (typeof value === `object` && value !== null) || typeof value === `function`

const cases: Record<BuiltinType, () => unknown[]> = {
  undefined: () => [undefined],
  null: () => [null],
  boolean: () => [false, true],
  number: () => [0, -0, 42, Infinity, -Infinity, Number.NaN, 3.14],
  bigint: () => [0n, 42n, 23_423_423_498_234n],
  string: () => [``, `abc`],
  symbol: () => [
    // eslint-disable-next-line symbol-description
    Symbol(),
    Symbol(`blah`),
    Symbol.for(`wow`),
    Symbol.iterator,
  ],
  Boolean: () => [new Boolean(false), new Boolean(true)],
  Number: () => [
    new Number(0),
    new Number(-0),
    new Number(42),
    new Number(Infinity),
    new Number(-Infinity),
    new Number(Number.NaN),
    new Number(3.14),
  ],
  BigInt: (): unknown[] => [
    Object(0n),
    Object(42n),
    Object(23_423_423_498_234n),
  ],
  String: () => [new String(``), new String(`abc`)],
  Symbol: (): unknown[] => [
    // eslint-disable-next-line symbol-description
    Object(Symbol()),
    Object(Symbol(`blah`)),
    Object(Symbol.for(`wow`)),
  ],
  Array: () => [[], [42]],
  Map: () => [
    new Map(),
    new Map([
      [1, 2],
      [3, 4],
    ]),
  ],
  Set: () => [new Set(), new Set([1, 2, 3, 4])],
  WeakMap: () => [
    new WeakMap(),
    new WeakMap([
      [{}, 2],
      [{}, 4],
    ]),
  ],
  WeakSet: () => [new WeakSet(), new WeakSet([{}, {}])],
  // eslint-disable-next-line func-names
  Function: () => [() => {}, function () {}, function func() {}],
  // eslint-disable-next-line func-names
  GeneratorFunction: () => [function* () {}, function* func() {}],
  AsyncFunction: () => [
    async () => {},
    async function () {},
    // eslint-disable-next-line func-names
    async function func() {},
  ],
  AsyncGeneratorFunction: () => [
    async function* () {},
    // eslint-disable-next-line func-names
    async function* func() {},
  ],
  Arguments: () => [
    (function () {
      // eslint-disable-next-line prefer-rest-params
      return arguments
    })(),
    (function (..._: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      return arguments
    })(1, 2, 3),
  ],
  Promise: () => [Promise.resolve(42), new Promise(() => {})],
  Date: () => [new Date(), new Date(Number.NaN)],
  RegExp: () => [
    /(?:)/,
    /a/g,
    (() => {
      const regExp = /a/g
      regExp.exec(`a`)
      return regExp
    })(),
  ],
  URL: () => [
    new URL(`https://example.com/`),
    new URL(`https://user:pass@example.com/path?q=1#hash`),
  ],
  URLSearchParams: () => [
    new URLSearchParams(),
    new URLSearchParams(`a=1&b=2`),
  ],
  WeakRef: () => [new WeakRef({})],
  FinalizationRegistry: () => [new FinalizationRegistry(() => {})],
  ArrayBuffer: () => [new ArrayBuffer(), new ArrayBuffer(10)],
  SharedArrayBuffer: () => [new SharedArrayBuffer(), new SharedArrayBuffer(10)],
  Buffer: () => [Buffer.from([1, 2, 3]), Buffer.from(new ArrayBuffer())],
  Int8Array: () => [new Int8Array(), new Int8Array([1, 2, 3])],
  Uint8Array: () => [new Uint8Array(), new Uint8Array([1, 2, 3])],
  Uint8ClampedArray: () => [
    new Uint8ClampedArray(),
    new Uint8ClampedArray([1, 2, 3]),
  ],
  Int16Array: () => [new Int16Array(), new Int16Array([1, 2, 3])],
  Uint16Array: () => [new Uint16Array(), new Uint16Array([1, 2, 3])],
  Int32Array: () => [new Int32Array(), new Int32Array([1, 2, 3])],
  Uint32Array: () => [new Uint32Array(), new Uint32Array([1, 2, 3])],
  BigInt64Array: () => [new BigInt64Array(), new BigInt64Array([1n, 2n, 3n])],
  BigUint64Array: () => [
    new BigUint64Array(),
    new BigUint64Array([1n, 2n, 3n]),
  ],
  Float16Array: () =>
    typeof Float16Array === `undefined`
      ? []
      : [new Float16Array(), new Float16Array([3.14, -1.2])],
  Float32Array: () => [new Float32Array(), new Float32Array([3.14, -1.2])],
  Float64Array: () => [new Float64Array(), new Float64Array([3.14, -1.2])],
  DataView: () => [
    new DataView(new ArrayBuffer()),
    new DataView(new ArrayBuffer(10)),
  ],
  Error: () => [new Error(), new Error(`message`)],
  EvalError: () => [new EvalError(), new EvalError(`message`)],
  RangeError: () => [new RangeError(), new RangeError(`message`)],
  ReferenceError: () => [new ReferenceError(), new ReferenceError(`message`)],
  SyntaxError: () => [new SyntaxError(), new SyntaxError(`message`)],
  TypeError: () => [new TypeError(), new TypeError(`message`)],
  URIError: () => [new URIError(), new URIError(`message`)],
  AggregateError: () => [
    new AggregateError([]),
    new AggregateError([new Error()], `message`),
  ],
  'Temporal.Duration': () => [
    new Temporal.Duration(),
    new Temporal.Duration(1, 2, 3),
    Temporal.Duration.from({ hours: 1 }),
  ],
  'Temporal.Instant': () => [
    Temporal.Instant.fromEpochMilliseconds(0),
    Temporal.Instant.fromEpochMilliseconds(Date.now()),
  ],
  'Temporal.PlainDate': () => [
    new Temporal.PlainDate(2024, 1, 15),
    Temporal.PlainDate.from(`2024-01-15`),
  ],
  'Temporal.PlainDateTime': () => [
    new Temporal.PlainDateTime(2024, 1, 15, 12),
    Temporal.PlainDateTime.from(`2024-01-15T12:00:00`),
  ],
  'Temporal.PlainMonthDay': () => [
    new Temporal.PlainMonthDay(1, 15),
    Temporal.PlainMonthDay.from(`01-15`),
  ],
  'Temporal.PlainTime': () => [
    new Temporal.PlainTime(),
    new Temporal.PlainTime(12),
    Temporal.PlainTime.from(`12:00:00`),
  ],
  'Temporal.PlainYearMonth': () => [
    new Temporal.PlainYearMonth(2024, 1),
    Temporal.PlainYearMonth.from(`2024-01`),
  ],
  'Temporal.ZonedDateTime': () => [
    new Temporal.ZonedDateTime(0n, `UTC`),
    Temporal.ZonedDateTime.from(`2024-01-15T12:00:00+00:00[UTC]`),
  ],
  Object: (): unknown[] => [{}, Object.create(null)],
}

const SPOOFABLE_TYPES = new Set<BuiltinType>([
  `Arguments`,
  ...((Error.isError as object | undefined)
    ? []
    : ([
        `Error`,
        `EvalError`,
        `RangeError`,
        `ReferenceError`,
        `SyntaxError`,
        `TypeError`,
        `URIError`,
        `AggregateError`,
      ] satisfies BuiltinType[])),
])

const expandedCases = Object.entries(cases).map(
  ([type, values]) =>
    [
      type as BuiltinType,
      [
        ...values(),
        ...(SPOOFABLE_TYPES.has(type as BuiltinType)
          ? []
          : withToStringTag(values())),
        ...withObjectPrototype(values()),
        ...fromDifferentRealm(values),
      ],
    ] as const,
)

it.each<readonly [unknown, BuiltinType]>(
  expandedCases.flatMap(([expectedType, values]) =>
    values.map(value => [value, expectedType]),
  ),
)(`builtinType(%o) -> %s`, (value, expectedType) => {
  const actualType = builtinType(value)

  expect(actualType).toBe(expectedType)

  // Check that we're the same as `which-builtin-type` where relevant.
  const thirdPartyType = whichBuiltinType(value) as unknown
  if (typeof thirdPartyType !== `string`) {
    return
  }

  const canonicalizedActualType = actualType.toLowerCase()
  const canonicalizedThirdPartyType = thirdPartyType.toLowerCase()
  if (
    EXPECTED_WHICH_BUILTIN_TYPE_MISMATCHES.has(
      `${canonicalizedActualType}:${canonicalizedThirdPartyType}`,
    )
  ) {
    // This is a known and expected mismatch.
    return
  }

  expect(canonicalizedActualType).toBe(canonicalizedThirdPartyType)
})

/**
 * Known scenarios where `which-builtin-type` differs because it's wrong or
 * because we have a different contract. Each entry is `actual:thirdParty`.
 */
const EXPECTED_WHICH_BUILTIN_TYPE_MISMATCHES = new Set<string>([
  // `which-builtin-type` seems to mishandle async generator functions.
  `asyncgeneratorfunction:function`,

  // `which-builtin-type` doesn't detect `Arguments` objects.
  `arguments:object`,

  // `which-builtin-type` seems to erroneously use the `Symbol.toStringTag`
  // value sometimes.
  `symbol:lies!`,
  `url:lies!`,
  `urlsearchparams:lies!`,
  `arraybuffer:lies!`,
  `sharedarraybuffer:lies!`,
  `dataview:lies!`,
  `temporal.duration:lies!`,
  `temporal.instant:lies!`,
  `temporal.plaindate:lies!`,
  `temporal.plaindatetime:lies!`,
  `temporal.plainmonthday:lies!`,
  `temporal.plaintime:lies!`,
  `temporal.plainyearmonth:lies!`,
  `temporal.zoneddatetime:lies!`,
  `object:lies!`,

  // `which-builtin-type` seems to mishandle `Buffer`.
  `buffer:uint8array`,

  // `which-builtin-type` doesn't detect Error types robustly.
  `error:lies!`,
  `error:object`,
  `evalerror:lies!`,
  `evalerror:object`,
  `rangeerror:lies!`,
  `rangeerror:object`,
  `referenceerror:lies!`,
  `referenceerror:object`,
  `syntaxerror:lies!`,
  `syntaxerror:object`,
  `typeerror:lies!`,
  `typeerror:object`,
  `urierror:lies!`,
  `urierror:object`,
  `aggregateerror:lies!`,
  `aggregateerror:object`,
])

const anythingArb = fc.anything({
  withBoxedValues: true,
  withSet: true,
  withMap: true,
  withObjectString: true,
  withNullPrototype: true,
  withBigInt: true,
  withDate: true,
  withTypedArray: true,
  withSparseArray: true,
})

test.prop([anythingArb], {
  numRuns: 50_000,
  examples: Object.values(cases)
    .flatMap(values => values())
    .map(value => [value]),
})(
  `builtinType always returns a type`,
  value => {
    const actualType = builtinType(value)

    expect(actualType).toBeOneOf(Object.keys(cases))
  },
  25_000,
)

test.prop([fc.clone(anythingArb, 2)], {
  numRuns: 50_000,
  examples: Object.entries(cases).flatMap(
    ([type, values]): [[unknown, unknown]][] => {
      if (type === `symbol` || type.endsWith(`Function`)) {
        // These would be compared by reference.
        return []
      }
      const values1 = values()
      const values2 = values()
      return values1.map((value1, index) => [[value1, values2[index]]])
    },
  ),
})(
  `builtinType never mutates the input`,
  ([value1, value2]) => {
    builtinType(value1)

    expect(value1).toStrictEqual(value2)
  },
  25_000,
)
