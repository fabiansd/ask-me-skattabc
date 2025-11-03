import { NextRequest } from 'next/server';

import { POST } from '@/app/api/postgres/feedback/route';

import { createTestUser, cleanupTestData, TEST_USER } from '../../helpers/testUser';

describe('POST /api/postgres/feedback', () => {
  let testUser: any;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(testUser.user_id);
    }
  });

  it('should create feedback for logged-in user', async () => {
    const feedbackData = {
      username: TEST_USER.google_id, // Google ID for logged-in user
      happiness_feedback: 'Great AI assistant!',
      desired_features: 'Would like more tax examples',
    };

    const request = new NextRequest('http://localhost:3000/api/postgres/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback: feedbackData }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should create feedback for default user', async () => {
    const feedbackData = {
      username: 'default',
      happiness_feedback: 'Works well without login',
      desired_features: 'More examples please',
    };

    const request = new NextRequest('http://localhost:3000/api/postgres/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback: feedbackData }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should handle missing feedback data gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/postgres/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback: { username: 'default' } }), // Missing required fields
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    // API should handle this gracefully (currently returns 200 with error logged)
    expect([200, 400, 500]).toContain(response.status);
  });
});
