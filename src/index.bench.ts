import { fc } from '@fast-check/vitest'
import { bench } from 'vitest'
import whichBuiltinType from 'which-builtin-type'
import builtinType from './index.ts'

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

const values = fc.sample(anythingArb, { seed: 42, numRuns: 500 })

bench(
  `whichBuiltinType`,
  () => {
    for (const value of values) {
      whichBuiltinType(value)
    }
  },
  { warmupIterations: 75 },
)

bench(
  `builtinType`,
  () => {
    for (const value of values) {
      builtinType(value)
    }
  },
  { warmupIterations: 75 },
)
