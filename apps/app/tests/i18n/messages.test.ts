import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const LOCALES = ['en', 'ar'] as const;
const read = (locale: string) =>
  readFileSync(resolve(process.cwd(), `src/messages/${locale}.json`), 'utf8');

/**
 * `JSON.parse` silently keeps the last of two equal keys in one object, which once hid an
 * entire group of labels. This walks the raw text and reports each such key with its path.
 */
function findDuplicateKeys(source: string): string[] {
  const token = /"((?:[^"\\]|\\.)*)"\s*:|[{}]/g;
  const scopes: Array<{ name: string; seen: Set<string> }> = [{ name: '', seen: new Set() }];
  const duplicates: string[] = [];
  let pendingName = '';

  for (let match = token.exec(source); match; match = token.exec(source)) {
    if (match[0] === '{') {
      scopes.push({ name: pendingName, seen: new Set() });
    } else if (match[0] === '}') {
      scopes.pop();
    } else {
      const key = match[1] ?? '';
      const scope = scopes[scopes.length - 1];
      if (scope?.seen.has(key)) {
        duplicates.push([...scopes.map((entry) => entry.name), key].filter(Boolean).join('.'));
      }
      scope?.seen.add(key);
      pendingName = key;
    }
  }
  return duplicates;
}

function flatten(value: unknown, prefix = ''): string[] {
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) =>
      flatten(inner, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

describe('message bundles', () => {
  it.each(LOCALES)('%s has no key defined twice in the same group', (locale) => {
    expect(findDuplicateKeys(read(locale))).toEqual([]);
  });

  it('has exactly the same keys in English and Arabic', () => {
    const [en, ar] = LOCALES.map((locale) => new Set(flatten(JSON.parse(read(locale)))));
    const missingInArabic = [...(en ?? [])].filter((key) => !ar?.has(key));
    const missingInEnglish = [...(ar ?? [])].filter((key) => !en?.has(key));

    expect({ missingInArabic, missingInEnglish }).toEqual({
      missingInArabic: [],
      missingInEnglish: [],
    });
  });

  it('the duplicate finder actually finds duplicates', () => {
    expect(findDuplicateKeys('{"a":{"x":1,"x":2},"b":1}')).toEqual(['a.x']);
    expect(findDuplicateKeys('{"a":{"x":1},"b":{"x":2}}')).toEqual([]);
  });
});
