export function uniqueId(): string {
  return Math.random().toString(36).substr(2);
}

export function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
