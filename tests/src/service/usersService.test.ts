import { users } from '@prisma/client';

import { createDefaultUser, findUserById } from '@/app/src/consumers/postgresConsumer';
import { createUserIfNotExist, getUserById } from '@/app/src/service/users/usersService';

jest.mock('@/app/src/consumers/postgresConsumer');

const mockCreateDefaultUser = createDefaultUser as jest.MockedFunction<typeof createDefaultUser>;
const mockFindUserById = findUserById as jest.MockedFunction<typeof findUserById>;

describe('usersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user for valid user ID', async () => {
      const mockUser: users = {
        user_id: 123,
        username: 'testuser',
        email: 'test@example.com',
        auth_provider: 'google',
        google_id: 'google_123',
        query_count: 5,
        created_at: new Date('2024-01-01'),
      };

      mockFindUserById.mockResolvedValue(mockUser);

      const result = await getUserById(123);

      expect(mockFindUserById).toHaveBeenCalledWith(123);
      expect(mockFindUserById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should handle different user types', async () => {
      const googleUser: users = {
        user_id: 1,
        username: 'google_user_123',
        email: 'google@example.com',
        auth_provider: 'google',
        google_id: 'google_user_123',
        query_count: 10,
        created_at: new Date(),
      };

      const defaultUser: users = {
        user_id: 2,
        username: 'default',
        email: null,
        auth_provider: 'default',
        google_id: null,
        query_count: 3,
        created_at: new Date(),
      };

      // Test Google user
      mockFindUserById.mockResolvedValueOnce(googleUser);
      const result1 = await getUserById(1);
      expect(result1).toEqual(googleUser);

      // Test default user
      mockFindUserById.mockResolvedValueOnce(defaultUser);
      const result2 = await getUserById(2);
      expect(result2).toEqual(defaultUser);

      expect(mockFindUserById).toHaveBeenCalledTimes(2);
    });

    it('should propagate database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockFindUserById.mockRejectedValue(dbError);

      await expect(getUserById(123)).rejects.toThrow('Database connection failed');
      expect(mockFindUserById).toHaveBeenCalledWith(123);
    });

    it('should handle user not found scenarios', async () => {
      mockFindUserById.mockResolvedValue(null as any);

      const result = await getUserById(999);

      expect(result).toBeNull();
      expect(mockFindUserById).toHaveBeenCalledWith(999);
    });
  });

  describe('createUserIfNotExist', () => {
    it('should create default user', async () => {
      const mockUser: users = {
        user_id: 1,
        username: 'default',
        email: null,
        auth_provider: 'default',
        google_id: null,
        query_count: 0,
        created_at: new Date('2024-01-01'),
      };

      mockCreateDefaultUser.mockResolvedValue(mockUser);

      const result = await createUserIfNotExist('default');

      expect(mockCreateDefaultUser).toHaveBeenCalledWith('default');
      expect(mockCreateDefaultUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should create Google user', async () => {
      const googleUsername = 'google_123456789';
      const mockUser: users = {
        user_id: 2,
        username: googleUsername,
        email: 'user@gmail.com',
        auth_provider: 'google',
        google_id: googleUsername,
        query_count: 0,
        created_at: new Date('2024-01-01'),
      };

      mockCreateDefaultUser.mockResolvedValue(mockUser);

      const result = await createUserIfNotExist(googleUsername);

      expect(mockCreateDefaultUser).toHaveBeenCalledWith(googleUsername);
      expect(result).toEqual(mockUser);
    });

    it('should handle different username formats', async () => {
      const usernames = ['default', 'google_123456789', 'github_user_abc', 'custom@example.com'];

      for (const username of usernames) {
        const mockUser: users = {
          user_id: Math.floor(Math.random() * 1000),
          username: username,
          email: username.includes('@') ? username : null,
          auth_provider: username.startsWith('google_') ? 'google' : 'default',
          google_id: username.startsWith('google_') ? username : null,
          query_count: 0,
          created_at: new Date(),
        };

        mockCreateDefaultUser.mockResolvedValueOnce(mockUser);

        const result = await createUserIfNotExist(username);

        expect(result.username).toBe(username);
      }

      expect(mockCreateDefaultUser).toHaveBeenCalledTimes(usernames.length);
    });

    it('should propagate database errors during user creation', async () => {
      const dbError = new Error('Unique constraint violation');
      mockCreateDefaultUser.mockRejectedValue(dbError);

      await expect(createUserIfNotExist('testuser')).rejects.toThrow('Unique constraint violation');
      expect(mockCreateDefaultUser).toHaveBeenCalledWith('testuser');
    });

    it('should handle empty username gracefully', async () => {
      const mockUser: users = {
        user_id: 1,
        username: '',
        email: null,
        auth_provider: 'default',
        google_id: null,
        query_count: 0,
        created_at: new Date(),
      };

      mockCreateDefaultUser.mockResolvedValue(mockUser);

      const result = await createUserIfNotExist('');

      expect(mockCreateDefaultUser).toHaveBeenCalledWith('');
      expect(result.username).toBe('');
    });

    it('should maintain data integrity from database response', async () => {
      const username = 'test_user_with_special_chars_æøå';
      const mockUser: users = {
        user_id: 999,
        username: username,
        email: 'test@domain.no',
        auth_provider: 'google',
        google_id: 'google_special_123',
        query_count: 42,
        created_at: new Date('2024-03-15T14:30:45.123Z'),
      };

      mockCreateDefaultUser.mockResolvedValue(mockUser);

      const result = await createUserIfNotExist(username);

      expect(result).toEqual(mockUser);
      expect(result.username).toBe(username);
      expect(result.query_count).toBe(42);
      expect(result.created_at).toEqual(new Date('2024-03-15T14:30:45.123Z'));
    });
  });
});
