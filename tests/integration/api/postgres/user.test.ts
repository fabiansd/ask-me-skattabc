import { NextRequest } from 'next/server';

import { GET, POST } from '@/app/api/postgres/user/route';

import { TEST_USER, DEFAULT_USER } from '../../helpers/testUser';

describe('User Management API', () => {
  describe('POST /api/postgres/user', () => {
    it('should create default user', async () => {
      const request = new NextRequest('http://localhost:3000/api/postgres/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: DEFAULT_USER.username }),
      });

      const response = await POST(request);
      expect(response).toBeDefined();
      expect(response!.status).toBe(200);

      const data = await response!.json();
      expect(data).toHaveProperty('username', DEFAULT_USER.username);
      expect(data).toHaveProperty('user_id');
    });

    it('should create Google test user', async () => {
      const { createTestUser } = await import('../../helpers/testUser');

      const user = await createTestUser();

      expect(user).toHaveProperty('google_id', TEST_USER.google_id);
      expect(user).toHaveProperty('email', TEST_USER.email);
      expect(user).toHaveProperty('username', TEST_USER.username);
      expect(user).toHaveProperty('auth_provider', 'google');
      expect(user).toHaveProperty('user_id');
    });

    it('should handle duplicate user creation gracefully', async () => {
      // Create user twice to test upsert behavior
      const request1 = new NextRequest('http://localhost:3000/api/postgres/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'duplicate-test' }),
      });

      const request2 = new NextRequest('http://localhost:3000/api/postgres/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'duplicate-test' }),
      });

      const response1 = await POST(request1);
      expect(response1).toBeDefined();
      expect(response1!.status).toBe(200);

      const response2 = await POST(request2);
      expect(response2).toBeDefined();
      expect(response2!.status).toBe(200);

      const data1 = await response1!.json();
      const data2 = await response2!.json();
      expect(data1.user_id).toBe(data2.user_id);
    });

    it('should require username parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/postgres/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response).toBeDefined();
      expect(response!.status).toBe(400);

      const data = await response!.json();
      expect(data.error).toBe('Username is required');
    });
  });

  describe('GET /api/postgres/user', () => {
    it('should get user by ID', async () => {
      // First create a user to get
      const createRequest = new NextRequest('http://localhost:3000/api/postgres/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'get-test-user' }),
      });

      const createResponse = await POST(createRequest);
      expect(createResponse).toBeDefined();
      const createdUser = await createResponse!.json();

      // Now get the user
      const getRequest = new NextRequest(
        `http://localhost:3000/api/postgres/user?userId=${createdUser.user_id}`,
        {
          method: 'GET',
        }
      );

      const response = await GET(getRequest);
      expect(response).toBeDefined();
      expect(response!.status).toBe(200);

      const data = await response!.json();
      expect(data).toHaveProperty('user_id', createdUser.user_id);
    });

    it('should handle invalid user ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/postgres/user?userId=999999', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      // Should handle gracefully, either 404 or empty result
      expect([200, 404]).toContain(response!.status);
    });

    it('should handle non-numeric user ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/postgres/user?userId=invalid', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      expect(response!.status).toBe(400);

      const data = await response!.json();
      expect(data.error).toBe('User ID must be a valid number');
    });
  });
});
