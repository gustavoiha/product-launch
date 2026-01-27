import { describe, expect, it, vi } from 'vitest';

const getJsonMock = vi.fn();
const postJsonMock = vi.fn();
const putJsonMock = vi.fn();

vi.mock('../src/api/client', () => ({
  getJson: getJsonMock,
  postJson: postJsonMock,
  putJson: putJsonMock
}));

vi.mock('../src/config/environment', () => ({
  getEnvironmentConfig: (): { amplify: { apiGatewayName: string } } => ({
    amplify: {
      apiGatewayName: 'productLaunchApi'
    }
  })
}));

const {
  fetchOwnerWaitlist,
  fetchWaitlistBySlug,
  updateWaitlist,
  fetchWaitlistEntries,
  submitPublicEntry
} = await import('../src/api/waitlist');

describe('waitlist api', (): void => {
  it('fetches the owner waitlist', async (): Promise<void> => {
    getJsonMock.mockResolvedValue({ id: '1', fields: [] });

    const response = await fetchOwnerWaitlist();

    expect(response.id).toBe('1');
    expect(getJsonMock).toHaveBeenCalledWith({
      apiName: 'productLaunchApi',
      path: '/waitlists/owner'
    });
  });

  it('fetches a waitlist by slug', async (): Promise<void> => {
    getJsonMock.mockResolvedValue({ id: '1', fields: [] });

    await fetchWaitlistBySlug('launch');

    expect(getJsonMock).toHaveBeenCalledWith({
      apiName: 'productLaunchApi',
      path: '/waitlists/launch'
    });
  });

  it('updates the waitlist', async (): Promise<void> => {
    putJsonMock.mockResolvedValue({ id: '1', fields: [] });

    await updateWaitlist('1', {
      productName: 'Product',
      title: 'Title',
      description: 'Desc',
      confirmationTitle: 'Thanks',
      confirmationDescription: 'Next',
      isActive: true,
      fields: []
    });

    expect(putJsonMock).toHaveBeenCalledWith({
      apiName: 'productLaunchApi',
      path: '/waitlists/1',
      body: {
        productName: 'Product',
        title: 'Title',
        description: 'Desc',
        confirmationTitle: 'Thanks',
        confirmationDescription: 'Next',
        isActive: true,
        fields: []
      }
    });
  });

  it('fetches waitlist entries', async (): Promise<void> => {
    getJsonMock.mockResolvedValue({ entries: [] });

    await fetchWaitlistEntries('1');

    expect(getJsonMock).toHaveBeenCalledWith({
      apiName: 'productLaunchApi',
      path: '/waitlists/1/entries'
    });
  });

  it('submits public entries', async (): Promise<void> => {
    postJsonMock.mockResolvedValue({ id: 'entry' });

    await submitPublicEntry('launch', { values: { email: 'test@example.com' } });

    expect(postJsonMock).toHaveBeenCalledWith({
      apiName: 'productLaunchApi',
      path: '/public/waitlists/launch/entries',
      body: { values: { email: 'test@example.com' } }
    });
  });
});
