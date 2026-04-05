import terser from '@rollup/plugin-terser'
import MagicString from 'magic-string'
import { defineConfig } from 'tsdown/config'

export default defineConfig([
  {
    entry: `src/index.ts`,
    platform: `neutral`,
    minify: false,
    dts: false,
    publint: true,
    plugins: [
      {
        name: `const-to-let`,
        renderChunk(code) {
          const magicString = new MagicString(code)
          magicString.replaceAll(`const `, `let `)
          return magicString.hasChanged()
            ? {
                code: magicString.toString(),
                map: magicString.generateMap({ hires: true }),
              }
            : null
        },
      },
      terser({
        ecma: 2020,
        module: true,
        toplevel: true,
        compress: { passes: 3 },
      }),
    ],
  },
  {
    entry: `src/index.ts`,
    dts: { emitDtsOnly: true },
  },
])
