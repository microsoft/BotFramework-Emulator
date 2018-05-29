import { cleanupId, __testables } from './conversation';

const { expect, test } = global as any;
const { findIdWithRole } = __testables;

test('find ID with role "bot"', () => {
  const activities = [{
    recipient: { id: 'bot-1', role: 'bot' }
  }, {
    recipient: { id: 'bot-2', role: 'bot' }
  }];

  expect(findIdWithRole(activities, 'bot')).toBe('bot-1');
});

test('clean up ID without specifying ID', () => {
  const activities = [{
    from: { role: 'bot' },
    recipient: { id: 'user-1', role: 'user' }
  }, {
    from: { role: 'user' },
    recipient: { id: 'bot-1', role: 'bot' }
  }, {
    from: { role: 'bot' },
    recipient: { id: 'user-2', role: 'user' }
  }, {
    from: { role: 'user' },
    recipient: { id: 'bot-2', role: 'bot' }
  }];

  expect(cleanupId(activities)).toMatchSnapshot();
});

test('clean up ID with ID specified', () => {
  const activities = [{
    from: { role: 'bot' },
    recipient: { id: 'user-1', role: 'user' }
  }, {
    from: { role: 'user' },
    recipient: { id: 'bot-1', role: 'bot' }
  }, {
    from: { role: 'bot' },
    recipient: { id: 'user-2', role: 'user' }
  }, {
    from: { role: 'user' },
    recipient: { id: 'bot-2', role: 'bot' }
  }];

  expect(cleanupId(activities, 'bot-x', 'user-x')).toMatchSnapshot();
});
