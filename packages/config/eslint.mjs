import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

// Physical-direction utilities break RTL; logical ones (ms-, pe-, start-, text-start) flip for free.
const PHYSICAL_CLASS =
  '(?:^|[\\s"\'`:!])(?:-?(?:ml|mr|pl|pr)-(?:\\S)|-?(?:left|right)-(?!to-)\\S|text-(?:left|right)\\b|border-[lr](?:-|\\b)|rounded-[lr](?:-|\\b)|rounded-(?:tl|tr|bl|br)(?:-|\\b)|float-(?:left|right)\\b)';

const rtlRule = {
  selector: `:matches(Literal[value=/${PHYSICAL_CLASS}/], TemplateElement[value.raw=/${PHYSICAL_CLASS}/])`,
  message:
    'Use logical properties (ms-/me-/ps-/pe-/start-/end-/text-start/text-end/border-s/rounded-s) so the layout flips in RTL.',
};

const featureInternals = ['api', 'hooks', 'components', 'schemas', 'types', 'constants', 'utils'];

const restrict = (...groups) => ({
  'no-restricted-imports': ['error', { patterns: groups }],
});

const noFeatureInternals = {
  group: featureInternals.map((dir) => `@/features/**/${dir}/**`),
  message: 'Import another feature only through its index.ts (public API).',
};
const noFeatures = {
  group: ['@/features', '@/features/**'],
  message: 'shared/ and lib/ must not depend on features/.',
};
const noShared = {
  group: ['@/shared', '@/shared/**'],
  message: 'lib/ must not depend on shared/.',
};
const noApps = {
  group: ['@/*', '../../apps/**'],
  message: 'packages/ui must not import from apps/.',
};

export const baseConfig = [
  {
    ignores: ['**/.next/**', '**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.turbo/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': 'error',
      'no-restricted-syntax': ['error', rtlRule],
    },
  },
];

export const nextConfig = [
  ...baseConfig,
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: restrict(noFeatureInternals),
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: restrict(noFeatureInternals),
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: restrict(noFeatures),
  },
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    rules: restrict(noFeatures, noShared),
  },
];

export const uiConfig = [...baseConfig, { files: ['src/**/*.{ts,tsx}'], rules: restrict(noApps) }];

export default nextConfig;
