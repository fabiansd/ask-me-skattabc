// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Sort tests to ensure user tests run first, then others
    const userTests = tests.filter(test => test.path.includes('postgres/user.test'));
    const otherTests = tests.filter(test => !test.path.includes('postgres/user.test'));

    return [...userTests, ...otherTests];
  }
}

module.exports = CustomSequencer;
