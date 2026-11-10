/** Join a path onto the configured base URL (works with or without a trailing slash on BASE_URL). */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const rest = path.replace(/^\/+/, '');
  return `${base}/${rest}`;
}
