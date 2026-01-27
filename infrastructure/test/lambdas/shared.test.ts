import { createSlug, normalizeEntryValues } from '../../lib/lambdas/shared';

test('createSlug falls back to waitlist for empty input', () => {
  expect(createSlug('   ')).toBe('waitlist');
});

test('normalizeEntryValues keeps only string and boolean values', () => {
  const normalized = normalizeEntryValues({
    email: 'test@example.com',
    approved: true,
    count: 3
  });

  expect(normalized).toEqual({
    email: 'test@example.com',
    approved: true
  });
});
