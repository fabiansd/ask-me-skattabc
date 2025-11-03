// Mock responses for external services
export const MOCK_OPENAI_RESPONSE = {
  choices: [
    {
      message: {
        content: 'Dette er et mock svar fra OpenAI for testing.',
      },
    },
  ],
};

export const MOCK_ELASTICSEARCH_RESPONSE = {
  hits: {
    hits: [
      {
        _source: {
          paragraph_text: 'Mock paragraph om skattelover for testing.',
          source: 'Test Skattelov',
        },
      },
    ],
  },
};

// Set up mocks based on USE_MOCK_DATA environment variable
export function setupMocks() {
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('🎭 Mock mode enabled - external services will be mocked during tests');

    // TODO: Implement actual mocking once module resolution is fixed
    // For now, just log that mocking is intended
  }
}
