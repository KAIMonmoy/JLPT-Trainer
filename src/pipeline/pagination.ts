export function parseTotalPages(html: string): number {
  const match = html.match(/Page\s+\d+\s+of\s+(\d+)/)
  return match ? Number(match[1]) : 1
}
