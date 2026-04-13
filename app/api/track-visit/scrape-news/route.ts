import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL diperlukan' },
        { status: 400 }
      )
    }

    // Validate URL
    let targetUrl: URL
    try {
      targetUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'URL tidak valid' },
        { status: 400 }
      )
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error('Gagal mengambil halaman')
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract metadata
    let title = ''
    let description = ''
    let image = ''
    let content = ''

    // Try different meta tags for title
    title = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text() ||
            ''

    // Try different meta tags for description
    description = $('meta[property="og:description"]').attr('content') ||
                  $('meta[name="twitter:description"]').attr('content') ||
                  $('meta[name="description"]').attr('content') ||
                  ''

    // Try different meta tags for image
    image = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            ''

    // Make image URL absolute if it's relative
    if (image && !image.startsWith('http')) {
      image = new URL(image, targetUrl.origin).toString()
    }

    // Try to extract main content
    // Common content selectors
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.entry-content',
      '.article-content',
      'main',
      '#main-content'
    ]

    for (const selector of contentSelectors) {
      const element = $(selector)
      if (element.length) {
        // Get text and clean it up
        content = element.text().trim().substring(0, 1000)
        break
      }
    }

    // If no content found, try paragraphs
    if (!content) {
      content = $('p').map((_, el) => $(el).text()).get()
        .filter(text => text.length > 50)
        .join('\n\n')
        .substring(0, 1000)
    }

    return NextResponse.json({
      title: title.substring(0, 200),
      description: description.substring(0, 500),
      content: content,
      image: image,
      url: url
    })

  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data dari URL' },
      { status: 500 }
    )
  }
}
