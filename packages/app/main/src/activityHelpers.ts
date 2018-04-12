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
