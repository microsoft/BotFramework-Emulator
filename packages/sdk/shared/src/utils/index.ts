import * as uuidv1 from "uuid/v1";

export function uniqueId(): string {
  return uuidv1().toString();
}

export function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
