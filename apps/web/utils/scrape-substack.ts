import { chromium } from "playwright-core";
import chromiumAws from "@sparticuz/chromium";

export interface SubstackPost {
  title: string;
  subtitle?: string;
  date: string;
  link: string;
  image?: string;
}

export async function scrapeSubstackPosts(url: string): Promise<SubstackPost[]> {
  try {
    const isDev = process.env.NODE_ENV === "development";

    const browser = await chromium.launch(isDev ? {
      headless: true
    } : {
      args: [...chromiumAws.args, "--disable-gpu"],
      executablePath: await chromiumAws.executablePath(),
      headless: true,
      chromiumSandbox: false
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // Go to URL and wait for content to load
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000 // Increase timeout to 60 seconds
    });

    // Wait for articles to appear with increased timeout
    await page.waitForSelector('.portable-archive-list', {
      timeout: 60000,
      state: 'attached'
    });

    // Add a small delay to ensure dynamic content is loaded
    await page.waitForTimeout(2000);

    // Extract post data
    const posts = await page.evaluate(() => {
      const articles = document.querySelectorAll('.post-preview-container');
      return Array.from(articles).map((article) => {
        const titleEl = article.querySelector<HTMLAnchorElement>('a[data-testid="post-preview-title"]');
        const subtitleEl = titleEl?.parentElement?.nextElementSibling?.querySelector('a');
        const dateEl = article.querySelector('time');
        const imageEl = article.querySelector('img');

        return {
          title: titleEl?.textContent?.trim() || '',
          subtitle: subtitleEl?.textContent?.trim() || undefined,
          date: dateEl?.dateTime || '',
          link: titleEl?.href || '',
          image: imageEl?.src || undefined,
        };
      });
    });

    // Close browser
    await context.close();
    await browser.close();

    return posts.filter(post => post.title && post.link);
  } catch (error) {
    console.error('Error scraping Substack posts:', error);
    return [];
  }
} 