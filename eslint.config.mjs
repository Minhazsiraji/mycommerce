import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import boundaries from 'eslint-plugin-boundaries'

/**
 * NOTE: boundaries v7 deprecates `element-types` and `entry-point` in favour of
 * `boundaries/dependencies`. Both still work; migrating is a tidy-up task, not a
 * correctness one. The deprecation warnings on each run are the only cost.
 */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'drizzle/**', 'next-env.d.ts'] },

  ...nextCoreWebVitals,
  ...nextTypescript,

  /**
   * The architectural rule from CLAUDE.md, enforced.
   *
   * app → modules → lib. A module may import another module only through its
   * index.ts. If this fails, fix the design rather than the config.
   */
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        // Each module directory is ONE element, so entry-point patterns below
        // resolve against the module root rather than against each file.
        { type: 'module', pattern: 'src/modules/*', capture: ['moduleName'] },
        { type: 'app', pattern: 'src/app' },
        { type: 'ui', pattern: 'src/components' },
        { type: 'lib', pattern: 'src/lib' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['module', 'ui', 'lib'] },
            // Cross-module access is narrowed to index.ts by entry-point below.
            { from: 'module', allow: ['ui', 'lib', 'module'] },
            { from: 'ui', allow: ['ui', 'lib'] },
            // lib is the base layer and must not depend on feature modules.
            { from: 'lib', allow: ['lib'] },
          ],
        },
      ],
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [
            { target: ['app', 'ui', 'lib'], allow: '**' },
            // Same module: any internal file.
            { target: [['module', { moduleName: '${from.moduleName}' }]], allow: '**' },
            // Different module: the public API, plus components, which routes
            // legitimately render. Everything else — repositories, services,
            // internal helpers — stays private.
            { target: ['module'], allow: ['index.ts', 'components/**'] },
          ],
        },
      ],
    },
  },

  /**
   * Drizzle Kit needs one object containing every table, so the schema barrel is
   * the single sanctioned place where lib reaches into modules.
   */
  {
    files: ['src/lib/db/schema.ts'],
    rules: { 'boundaries/element-types': 'off', 'boundaries/entry-point': 'off' },
  },
]

export default config
