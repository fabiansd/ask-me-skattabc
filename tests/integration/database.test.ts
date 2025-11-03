describe('Database Integration Tests', () => {
  test('should connect to application via health check', async () => {
    const response = await fetch('http://localhost:3000/api/health');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('should be able to create default user via API', async () => {
    const response = await fetch('http://localhost:3000/api/postgres/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'default' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('username', 'default');
  });
});
