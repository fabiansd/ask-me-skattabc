import { NextRequest } from 'next/server';

import { GET } from '@/app/api/conversations/route';

import { createTestUser, cleanupTestData, TEST_USER } from '../../helpers/testUser';

describe('GET /api/conversations', () => {
  let testUser: any;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(testUser.user_id);
    }
  });

  it('should return conversations for logged-in user', async () => {
    const url = `http://localhost:3000/api/conversations?auth_id=${TEST_USER.google_id}`;
    const request = new NextRequest(url, {
      method: 'GET',
    });

    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    // Note: May be empty array if no conversations exist yet
  });

  it('should return conversations for default user', async () => {
    const url = `http://localhost:3000/api/conversations?auth_id=default`;
    const request = new NextRequest(url, {
      method: 'GET',
    });

    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should require auth_id parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/conversations', {
      method: 'GET',
    });

    const response = await GET(request);

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('auth_id is required');
  });

  it('should handle invalid auth_id gracefully', async () => {
    const url = `http://localhost:3000/api/conversations?auth_id=invalid-user-id`;
    const request = new NextRequest(url, {
      method: 'GET',
    });

    const response = await GET(request);

    // Should either return empty array or handle error gracefully
    expect([200, 500]).toContain(response.status);
  });
});
