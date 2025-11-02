import { PrismaClient } from '@prisma/client';

describe('Database Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should connect to test database', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toEqual([{ test: 1 }]);
  });

  test('should have required tables', async () => {
    const tables = (await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `) as Array<{ table_name: string }>;

    const tableNames = tables.map(t => t.table_name);

    expect(tableNames).toContain('users');
    expect(tableNames).toContain('query_history');
    expect(tableNames).toContain('user_feedback');
  });
});
