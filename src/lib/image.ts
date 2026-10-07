/**
 * Helper to resolve image URL from backend static path, cloud URL, or data URI.
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7780/api/v1";
  try {
    const origin = new URL(apiUrl).origin;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${cleanPath}`;
  } catch {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `http://localhost:7780${cleanPath}`;
  }
}
