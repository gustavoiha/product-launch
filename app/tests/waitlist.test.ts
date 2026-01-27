import { describe, expect, it } from 'vitest';
import { createWaitlistStore } from '../src/state/waitlist';

describe('waitlist store', (): void => {
  it('adds and removes fields', (): void => {
    const store = createWaitlistStore();
    const added = store.addField('Company', 'text');

    expect(added).toBe(true);
    expect(store.waitlistFields.value.length).toBe(2);

    const addedField = store.waitlistFields.value[1];
    store.removeField(addedField.id);

    expect(store.waitlistFields.value.length).toBe(1);
  });

  it('creates a waitlist entry from form values', (): void => {
    const store = createWaitlistStore();
    store.publicFormValues['email-field'] = 'hello@example.com';

    store.submitPublicJoin();

    expect(store.waitlistEntries.value.length).toBe(1);
    expect(store.publicJoinCompleted.value).toBe(true);
    expect(store.waitlistEntries.value[0].values.primary).toBe('hello@example.com');
  });

  it('computes a slug based on the waitlist title', (): void => {
    const store = createWaitlistStore();
    store.waitlistConfig.title = 'New Product Launch!';

    expect(store.waitlistSlug.value).toBe('new-product-launch');
  });
});
