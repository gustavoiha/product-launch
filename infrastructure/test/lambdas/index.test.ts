import {
  getOwnerWaitlist,
  getWaitlistBySlug,
  updateWaitlist,
  getWaitlistEntries,
  submitPublicEntry
} from '../../lib/lambdas';

test('lambdas index exports handlers', () => {
  expect(typeof getOwnerWaitlist).toBe('function');
  expect(typeof getWaitlistBySlug).toBe('function');
  expect(typeof updateWaitlist).toBe('function');
  expect(typeof getWaitlistEntries).toBe('function');
  expect(typeof submitPublicEntry).toBe('function');
});
