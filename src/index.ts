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
  | `String`
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
      if (type) {
        return type
      }
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

const INTERNAL_SLOT_STATIC_NAMES: [BuiltinType, string][] = [
  [`Array`, `isArray`],
  [`Buffer`, `isBuffer`],
]
const INTERNAL_SLOT_PROTOTYPE_NAMES: [BuiltinType, string, any[]?][] = [
  [`Boolean`, `valueOf`],
  [`Number`, `valueOf`],
  [`String`, `valueOf`],
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
]

type BuiltinTypeFunction = (value: object) => BuiltinType | undefined

const TYPE_TAG_FUNCTIONS: BuiltinTypeFunction[] = [
  ...INTERNAL_SLOT_STATIC_NAMES.flatMap<BuiltinTypeFunction>(([type, name]) => {
    const Class = globalThis[type as keyof typeof globalThis] as
      | Record<string, (value: unknown) => boolean>
      | undefined
    if (!Class) {
      return []
    }
    const func = Class[name]!
    return value => (func(value) ? type : undefined)
  }),
  ...INTERNAL_SLOT_PROTOTYPE_NAMES.flatMap<BuiltinTypeFunction>(
    ([type, name, args = []]) => {
      let prototype: object | undefined | null = (
        globalThis[type as keyof typeof globalThis] as
          | {
              prototype: object
            }
          | undefined
      )?.prototype
      let descriptor: PropertyDescriptor | undefined
      do {
        descriptor = Object.getOwnPropertyDescriptor(prototype, name)
        if (descriptor) {
          break
        }
        prototype = Object.getPrototypeOf(prototype) as object | null
      } while (prototype)
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
        // 2. Return `null` or `undefined
        try {
          return func.apply(value, args) == null ? undefined : type
        } catch {
          return undefined
        }
      }
    },
  ),
]
const typedArrayToStringTag = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Uint8Array.prototype),
  Symbol.toStringTag,
)?.get
if (typedArrayToStringTag) {
  TYPE_TAG_FUNCTIONS.push(
    value => typedArrayToStringTag.call(value) as BuiltinType | undefined,
  )
}

export default builtinType
