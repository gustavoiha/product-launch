import { describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();
const postMock = vi.fn();
const putMock = vi.fn();

vi.mock('aws-amplify/api', () => ({
  get: getMock,
  post: postMock,
  put: putMock
}));

const { getJson, postJson, putJson } = await import('../src/api/client');

describe('api client', (): void => {
  it('handles GET requests', async (): Promise<void> => {
    getMock.mockReturnValue({
      response: Promise.resolve({
        body: {
          json: async (): Promise<{ message: string }> => ({ message: 'ok' })
        }
      })
    });

    const response = await getJson<{ message: string }>({
      apiName: 'api',
      path: '/waitlists'
    });

    expect(response.message).toBe('ok');
  });

  it('handles POST requests', async (): Promise<void> => {
    postMock.mockReturnValue({
      response: Promise.resolve({
        body: {
          json: async (): Promise<{ id: string }> => ({ id: 'entry' })
        }
      })
    });

    const response = await postJson<{ id: string }>({
      apiName: 'api',
      path: '/waitlists',
      body: { name: 'Test' }
    });

    expect(response.id).toBe('entry');
  });

  it('handles PUT requests', async (): Promise<void> => {
    putMock.mockReturnValue({
      response: Promise.resolve({
        body: {
          json: async (): Promise<{ updated: boolean }> => ({ updated: true })
        }
      })
    });

    const response = await putJson<{ updated: boolean }>({
      apiName: 'api',
      path: '/waitlists/1',
      body: { title: 'Updated' }
    });

    expect(response.updated).toBe(true);
  });
});
