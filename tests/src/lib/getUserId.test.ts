import { Session } from 'next-auth';

import { getUserId } from '@/app/src/lib/getUserId';

describe('getUserId', () => {
  it('should return user ID from Google session', () => {
    const mockSession: Session = {
      user: {
        id: 'google_123456789',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: '2024-12-31',
    };

    const result = getUserId(mockSession);

    expect(result).toBe('google_123456789');
  });

  it('should return "default" for anonymous users (null session)', () => {
    const result = getUserId(null);

    expect(result).toBe('default');
  });

  it('should return "default" when session exists but user is undefined', () => {
    const mockSession = {
      expires: '2024-12-31',
      // No user property
    } as unknown as Session;

    const result = getUserId(mockSession);

    expect(result).toBe('default');
  });

  it('should handle different types of user IDs', () => {
    const sessions = [
      {
        user: { id: 'google_abc123' },
        expires: '2024-12-31',
      },
      {
        user: { id: 'github_xyz789' },
        expires: '2024-12-31',
      },
      {
        user: { id: 'custom_user_001' },
        expires: '2024-12-31',
      },
    ] as Session[];

    const results = sessions.map(session => getUserId(session));

    expect(results).toEqual(['google_abc123', 'github_xyz789', 'custom_user_001']);
  });

  it('should handle empty string user ID', () => {
    const mockSession: Session = {
      user: {
        id: '',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    const result = getUserId(mockSession);

    expect(result).toBe('default');
  });

  it('should handle whitespace-only user ID', () => {
    const mockSession: Session = {
      user: {
        id: '   ',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    const result = getUserId(mockSession);

    expect(result).toBe('   '); // Function doesn't trim, returns as-is
  });
});
