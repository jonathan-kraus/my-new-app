export async function mbtaFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      "Transit information could not be loaded. Please try again.",
    );
  return response.json();
}
