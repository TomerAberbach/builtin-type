/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable eqeqeq */

export type BuiltinType =
  // Primitives
  | `undefined`
  | `null`
  | `boolean`
  | `number`
  | `bigint`
  | `string`
  | `symbol`
  // Primitive wrappers
  | `Boolean`
  | `Number`
  | `BigInt`
  | `String`
  | `Symbol`
  // Collections
  | `Array`
  | `Map`
  | `Set`
  | `WeakMap`
  | `WeakSet`
  // Functions
  | `Function`
  | `GeneratorFunction`
  | `AsyncFunction`
  | `AsyncGeneratorFunction`
  | `Arguments`
  // Other built-ins
  | `Promise`
  | `Date`
  | `RegExp`
  | `URL`
  | `URLSearchParams`
  | `WeakRef`
  | `FinalizationRegistry`
  // Typed arrays
  | `ArrayBuffer`
  | `SharedArrayBuffer`
  | `Buffer`
  | `Int8Array`
  | `Uint8Array`
  | `Uint8ClampedArray`
  | `Int16Array`
  | `Uint16Array`
  | `Int32Array`
  | `Uint32Array`
  | `BigInt64Array`
  | `BigUint64Array`
  | `Float16Array`
  | `Float32Array`
  | `Float64Array`
  | `DataView`
  // Errors
  | `Error`
  | `EvalError`
  | `RangeError`
  | `ReferenceError`
  | `SyntaxError`
  | `TypeError`
  | `URIError`
  | `AggregateError`
  // Temporal
  | `Temporal.Duration`
  | `Temporal.Instant`
  | `Temporal.PlainDate`
  | `Temporal.PlainDateTime`
  | `Temporal.PlainMonthDay`
  | `Temporal.PlainTime`
  | `Temporal.PlainYearMonth`
  | `Temporal.ZonedDateTime`
  // Catch-all
  | `Object`

const builtinType = (value: unknown): BuiltinType => {
  if (value === null) {
    return `null`
  }

  const type = typeof value
  if (type == `object`) {
    for (const builtinType of TYPE_TAG_FUNCTIONS) {
      const type = builtinType(value as object)
      if (!type) {
        continue
      }
      if (type == `Error`) {
        const name = (Object.getPrototypeOf(value) as { name?: string } | null)
          ?.name
        if (BUILTIN_ERROR_SUBCLASS_NAMES.has(name)) {
          return name as BuiltinType
        }
      }
      return type
    }

    // It must be a plain object or custom class.
    return `Object`
  } else if (type == `function`) {
    const source = Function.prototype.toString.call(value)
    // eslint-disable-next-line unicorn/prefer-set-has
    const beforeParen = source.slice(0, source.indexOf(`(`))
    const isAsync = beforeParen.includes(`async`)
    const isGenerator = beforeParen.includes(`*`)
    return `${isAsync ? `Async` : ``}${isGenerator ? `Generator` : ``}Function`
  } else {
    return type
  }
}

const INTERNAL_SLOT_PREDICATE_NAMES: BuiltinType[] = [
  `Array`,
  `Buffer`,
  `Error`,
]
const INTERNAL_SLOT_PROTOTYPE_NAMES: [BuiltinType, string, any[]?][] = [
  [`Boolean`, `valueOf`],
  [`Number`, `valueOf`],
  [`BigInt`, `valueOf`],
  [`String`, `valueOf`],
  [`Symbol`, `valueOf`],
  [`Map`, `has`],
  [`Set`, `has`],
  [`WeakMap`, `has`],
  [`WeakSet`, `has`],
  [`WeakRef`, `deref`],
  [`Promise`, `then`],
  [`Date`, `getDay`],
  [`RegExp`, `global`],
  [`URL`, `href`],
  [`URLSearchParams`, `size`],
  [`ArrayBuffer`, `byteLength`],
  [`SharedArrayBuffer`, `byteLength`],
  [`DataView`, `buffer`],
  [`FinalizationRegistry`, `unregister`, [{}]],
  [`Temporal.ZonedDateTime`, `timeZoneId`],
  [`Temporal.Instant`, `epochNanoseconds`],
  [`Temporal.PlainDateTime`, `year`],
  [`Temporal.PlainDate`, `year`],
  [`Temporal.PlainTime`, `hour`],
  [`Temporal.PlainYearMonth`, `year`],
  [`Temporal.PlainMonthDay`, `monthCode`],
  [`Temporal.Duration`, `sign`],
]
const TO_STRING_TYPE_NAMES = new Set<BuiltinType>([`Error`, `Arguments`])
const BUILTIN_ERROR_SUBCLASS_NAMES = new Set<string | undefined>([
  `EvalError`,
  `RangeError`,
  `ReferenceError`,
  `SyntaxError`,
  `TypeError`,
  `URIError`,
  `AggregateError`,
])

type BuiltinTypeFunction = (value: object) => BuiltinType | `` | undefined

const TYPE_TAG_FUNCTIONS: BuiltinTypeFunction[] = [
  ...INTERNAL_SLOT_PREDICATE_NAMES.flatMap<BuiltinTypeFunction>(type => {
    const func = (
      globalThis[type as keyof typeof globalThis] as
        | Record<string, (value: unknown) => boolean>
        | undefined
    )?.[`is${type}`]
    return func ? value => (func(value) ? type : ``) : []
  }),
  ...INTERNAL_SLOT_PROTOTYPE_NAMES.flatMap<BuiltinTypeFunction>(
    ([type, name, args = []]) => {
      let prototype: object | undefined | null = (
        type
          .split(`.`)
          .reduce<unknown>(
            (value, key) =>
              (value as Record<string, unknown> | undefined)?.[key],
            globalThis,
          ) as { prototype: object } | undefined
      )?.prototype
      if (!prototype) {
        return []
      }
      let descriptor: PropertyDescriptor | undefined
      for (
        ;
        prototype &&
        !(descriptor = Object.getOwnPropertyDescriptor(prototype, name));
        prototype = Object.getPrototypeOf(prototype) as object | null
      ) {
        //
      }
      if (!descriptor) {
        return []
      }

      const func = (descriptor.value ?? descriptor.get) as (
        this: any,
        ...args: any[]
      ) => any
      return value => {
        // Each function above will do one of the following when applied to a
        // value not of the proper type:
        // 1. Throw
        // 2. Return `null` or `undefined`
        try {
          return func.apply(value, args) == null ? `` : type
        } catch {
          return undefined
        }
      }
    },
  ),
  value => {
    const type =
      !(Symbol.toStringTag in value) &&
      Object.prototype.toString.call(value).slice(8, -1)
    return TO_STRING_TYPE_NAMES.has(type as BuiltinType)
      ? (type as BuiltinType)
      : ``
  },
]
const typedArrayToStringTag = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Int8Array.prototype),
  Symbol.toStringTag,
)?.get
if (typedArrayToStringTag) {
  TYPE_TAG_FUNCTIONS.push(
    value => typedArrayToStringTag.call(value) as BuiltinType | undefined,
  )
}

export default builtinType
