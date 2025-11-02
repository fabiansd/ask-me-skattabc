import { PrismaClient, users } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function createTestUser(): Promise<users> {
  return await prisma.users.upsert({
    where: { google_id: TEST_USER.google_id },
    update: TEST_USER,
    create: TEST_USER,
  });
}

export async function createDefaultUser(): Promise<users> {
  return await prisma.users.upsert({
    where: { username: DEFAULT_USER.username },
    update: DEFAULT_USER,
    create: DEFAULT_USER,
  });
}

export async function cleanupTestData(userId: number): Promise<void> {
  // Clean up in reverse dependency order
  await prisma.user_feedback.deleteMany({ where: { user_id: userId } });
  await prisma.query_history.deleteMany({ where: { user_id: userId } });
  await prisma.conversations.deleteMany({ where: { user_id: userId } });
}

export async function getTestUser(): Promise<users | null> {
  return await prisma.users.findUnique({
    where: { google_id: TEST_USER.google_id },
  });
}
