import { describe, expect, it, vi } from 'vitest';

const fetchOwnerWaitlistMock = vi.fn();
const fetchWaitlistBySlugMock = vi.fn();
const fetchWaitlistEntriesMock = vi.fn();
const updateWaitlistMock = vi.fn();
const submitPublicEntryMock = vi.fn();

vi.mock('../src/api/waitlist', () => ({
  fetchOwnerWaitlist: fetchOwnerWaitlistMock,
  fetchWaitlistBySlug: fetchWaitlistBySlugMock,
  fetchWaitlistEntries: fetchWaitlistEntriesMock,
  updateWaitlist: updateWaitlistMock,
  submitPublicEntry: submitPublicEntryMock
}));

const { createWaitlistStore } = await import('../src/state/waitlist');

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

  it('creates a waitlist entry from form values', async (): Promise<void> => {
    const store = createWaitlistStore();
    store.publicFormValues['email-field'] = 'hello@example.com';
    submitPublicEntryMock.mockResolvedValue({
      id: 'entry-1',
      joinedAt: 'today',
      values: {
        'email-field': 'hello@example.com'
      }
    });

    await store.submitPublicJoin();

    expect(store.waitlistEntries.value.length).toBe(1);
    expect(store.publicJoinCompleted.value).toBe(true);
    expect(store.waitlistEntries.value[0].values.primary).toBe('hello@example.com');
  });

  it('loads the owner waitlist', async (): Promise<void> => {
    const store = createWaitlistStore();
    fetchOwnerWaitlistMock.mockResolvedValue({
      id: 'waitlist-1',
      slug: 'launch',
      productName: 'Product',
      title: 'Launch',
      description: 'Desc',
      confirmationTitle: 'Thanks',
      confirmationDescription: 'Next',
      isActive: true,
      fields: [
        {
          id: 'email-field',
          label: 'Email',
          type: 'email'
        }
      ]
    });

    await store.loadOwnerWaitlist();

    expect(store.waitlistConfig.title).toBe('Launch');
    expect(store.waitlistFields.value.length).toBe(1);
  });

  it('computes a slug based on the waitlist title', (): void => {
    const store = createWaitlistStore();
    store.waitlistConfig.title = 'New Product Launch!';

    expect(store.waitlistSlug.value).toBe('new-product-launch');
  });
});
