export function getActivityText(activity: any): string {
  if (activity) {
    if (activity.attachments && activity.attachments.length > 0)
      return activity.attachments[0].contentType;
    else {
      if (activity.text && activity.text.length > 50)
        return activity.text.substring(0, 50) + '...';

      return activity.text;
    }
  }
  return '';
}

export function getErrorText(err: any): string {
  if (err) {
    if (err.error) {
      return err.error;
    }
    else if (err.message) {
      return err.message;
    }
    else {
      return err.toString();
    }
  }
  return undefined;
}
