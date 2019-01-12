import { Activity } from "botframework-directlinejs";

interface CustomActivityProperties {
  from: {
    role?: string;
  };

  recipient?: {
    id?: string;
    role?: string;
  };
}

export type CustomActivity = Activity & CustomActivityProperties;

export function cleanupId(
  activities: CustomActivity[],
  botId: string = findIdWithRole(activities, "bot"),
  userId: string = findIdWithRole(activities, "user")
) {
  const roleIdMap = { bot: botId, user: userId };

  activities = activities.map((activity: any) => {
    const { type } = activity;

    if (
      type === "event" ||
      type === "message" ||
      type === "messageReaction" ||
      type === "typing"
    ) {
      activity = {
        ...activity,
        from: {
          ...activity.from,
          id: roleIdMap[activity.from.role] || activity.from.id
        },
        recipient: {
          ...activity.recipient,
          id: roleIdMap[activity.recipient.role] || activity.recipient.id
        }
      };
    }

    return activity;
  });

  return activities;
}

export function findIdWithRole(
  activities: CustomActivity[],
  role: string
): string {
  return activities.reduce((id: string, { recipient }) => {
    if (id) {
      return id;
    } else if (recipient && recipient.role === role) {
      return recipient.id;
    } else {
      return null;
    }
  }, null);
}

export const __TESTABLES = { findIdWithRole };
