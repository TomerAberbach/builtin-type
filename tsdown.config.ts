import terser from '@rollup/plugin-terser'
import { defineConfig } from 'tsdown/config'

export default defineConfig([
  {
    entry: `src/index.ts`,
    platform: `neutral`,
    minify: true,
    dts: false,
    publint: true,
    plugins: [terser()],
  },
  {
    entry: `src/index.ts`,
    dts: { emitDtsOnly: true },
  },
])
