/**
 * Builds a query string for admin list pages, dropping empty/undefined
 * params so filter links stay clean (e.g. no trailing `?q=`).
 */
export function buildAdminHref(
  basePath: string,
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}
