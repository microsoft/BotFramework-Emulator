export function cleanupId(
  activities: any[],
  botId: string = findIdWithRole(activities, 'bot'),
  userId: string = findIdWithRole(activities, 'user')
) {
  const roleIdMap = { bot: botId, user: userId };

  activities = activities.map(activity => ({
    ...activity,
    from: {
      ...activity.from,
      id: roleIdMap[activity.from.role] || activity.from.id
    },
    recipient: {
      ...activity.recipient,
      id: roleIdMap[activity.recipient.role] || activity.recipient.id
    }
  }));

  return activities;
}

function findIdWithRole(activities, role) {
  return activities.reduce(
    (id, { recipient }) => id || (recipient && recipient.role === role && recipient.id),
    null
  );
}

export const __testables = { findIdWithRole };
