import { NextRequest } from 'next/server';

import { POST } from '@/app/api/query/route';

import { setupMocks } from '../helpers/mockServices';
import { TEST_USER } from '../helpers/testUser';

setupMocks();

describe('POST /api/query', () => {
  it('should process query for logged-in user', async () => {
    const queryData = {
      searchText: 'Hva er fradrag for hjemmekontor?',
      isDetailed: false,
    };

    const url = `http://localhost:3000/api/query?auth_id=${TEST_USER.google_id}`;
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify(queryData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('conversation_id');
    expect(data).toHaveProperty('openaiResponse'); // Based on your actual API response
  });

  it('should process query for default user', async () => {
    const queryData = {
      searchText: 'Kan jeg trekke fra reiseutgifter?',
      isDetailed: true,
    };

    const url = `http://localhost:3000/api/query?auth_id=${TEST_USER.google_id}`;
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify(queryData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('openaiResponse'); // Based on your actual API response
  });

  it('should require auth_id parameter', async () => {
    const queryData = {
      searchText: 'Test question',
      isDetailed: false,
    };

    const request = new NextRequest('http://localhost:3000/api/query', {
      method: 'POST',
      body: JSON.stringify(queryData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('auth_id is required');
  });

  it('should handle invalid query data gracefully', async () => {
    const url = `http://localhost:3000/api/query?auth_id=${TEST_USER.google_id}`;
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    // Should handle gracefully with defaults instead of crashing
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('openaiResponse');
  });
});
