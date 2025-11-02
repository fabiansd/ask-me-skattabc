export const TEST_USER = {
  google_id: 'test-google-id-123',
  username: 'test-user',
  email: 'test@example.com',
  auth_provider: 'google' as const,
};

export const DEFAULT_USER = {
  username: 'default',
  email: 'default@example.com',
  auth_provider: 'default' as const,
};

export async function createTestUser(): Promise<any> {
  // Use the API to create a test user instead of direct Prisma calls
  const response = await fetch('http://localhost:3000/api/postgres/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: TEST_USER.username }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test user: ${response.status}`);
  }

  return await response.json();
}

export async function createDefaultUser(): Promise<any> {
  // Use the API to create default user instead of direct Prisma calls
  const response = await fetch('http://localhost:3000/api/postgres/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: DEFAULT_USER.username }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create default user: ${response.status}`);
  }

  return await response.json();
}

export async function cleanupTestData(userId: number): Promise<void> {
  // For integration tests, we'll rely on test database cleanup between runs
  // rather than trying to clean up individual records via API
  console.log(`Cleanup would remove data for user ${userId}`);
}

export async function getTestUser(): Promise<any> {
  // Get user via API instead of direct Prisma call
  const response = await fetch(`http://localhost:3000/api/postgres/user?userId=1`);

  if (!response.ok) {
    return null;
  }

  return await response.json();
}
