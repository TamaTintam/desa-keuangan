export function getYoutubeEmbedUrl(url: string): string {
  // Jika sudah format embed, return as-is
  if (url.includes('youtube.com/embed')) {
    return url
  }

  // Extract video ID dari berbagai format
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
  }

  return url // Return original if no match
}
