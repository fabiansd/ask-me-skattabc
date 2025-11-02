import path from 'path';

import { config } from 'dotenv';

import { setupMocks } from './helpers/mockServices';
import { createDefaultUser } from './helpers/testUser';

// Force load test environment variables
config({ path: path.join(__dirname, '../../.env.test'), override: true });

// Setup mocks
setupMocks();

// Global test setup
beforeAll(async () => {
  console.log('🧪 Integration test setup started');
  console.log('📦 Database URL:', process.env.DATABASE_URL);
  console.log('🎭 Mock mode:', process.env.USE_MOCK_DATA);

  // Ensure default user exists for all tests
  await createDefaultUser();
  console.log('✅ Default user created');
});

afterAll(async () => {
  console.log('🧪 Integration test teardown completed');
});
