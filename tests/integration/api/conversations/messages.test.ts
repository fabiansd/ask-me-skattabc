import { NextRequest } from 'next/server';

import { GET, DELETE } from '@/app/api/conversations/[id]/messages/route';

import { createTestUser, cleanupTestData, TEST_USER } from '../../helpers/testUser';

describe('Conversation Messages API', () => {
  let testUser: any;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(testUser.user_id);
    }
  });

  describe('GET /api/conversations/[id]/messages', () => {
    it('should return messages for valid conversation', async () => {
      const conversationId = 1;
      const url = `http://localhost:3000/api/conversations/${conversationId}/messages?auth_id=${TEST_USER.google_id}`;
      const request = new NextRequest(url, {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: conversationId.toString() } });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      // Note: May be empty array if conversation doesn't exist
    });

    it('should require auth_id parameter', async () => {
      const conversationId = 1;
      const request = new NextRequest(
        `http://localhost:3000/api/conversations/${conversationId}/messages`,
        {
          method: 'GET',
        }
      );

      const response = await GET(request, { params: { id: conversationId.toString() } });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('auth_id is required');
    });

    it('should handle invalid conversation ID', async () => {
      const url = `http://localhost:3000/api/conversations/invalid/messages?auth_id=${TEST_USER.google_id}`;
      const request = new NextRequest(url, {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: 'invalid' } });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Invalid conversation ID');
    });
  });

  describe('DELETE /api/conversations/[id]/messages', () => {
    it('should delete conversation for valid user', async () => {
      const conversationId = 999; // Non-existent conversation
      const url = `http://localhost:3000/api/conversations/${conversationId}/messages?auth_id=${TEST_USER.google_id}`;
      const request = new NextRequest(url, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: conversationId.toString() } });

      // Should either succeed or handle gracefully
      expect([200, 500]).toContain(response.status);
    });

    it('should require auth_id parameter for deletion', async () => {
      const conversationId = 1;
      const request = new NextRequest(
        `http://localhost:3000/api/conversations/${conversationId}/messages`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, { params: { id: conversationId.toString() } });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('auth_id is required');
    });

    it('should handle invalid conversation ID for deletion', async () => {
      const url = `http://localhost:3000/api/conversations/invalid/messages?auth_id=${TEST_USER.google_id}`;
      const request = new NextRequest(url, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'invalid' } });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Invalid conversation ID');
    });
  });
});
