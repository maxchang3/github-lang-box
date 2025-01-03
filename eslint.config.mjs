import defineConfig from '@maxchang/eslint-config'

export default defineConfig({
    type: 'app',
    typescript: true,
    javascript: {
        overrides: {
            'antfu/no-top-level-await': 'off',
        },
    },
})
