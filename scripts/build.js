import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import matter from "gray-matter";
import { marked } from "marked";

import { cleanDir, ensureDir, getFiles, getSlugFromFilename, slugify } from "./utils.js";
import { processAllImages, generateResponsiveHTML } from "./imageOptimizer.js";
import { renderPage } from "../templates/page.js";
import { renderPost } from "../templates/post.js";
import { renderBlogList } from "../templates/blog-list.js";
import { renderTagArchive } from "../templates/tag-archive.js";
import { renderTagIndex } from "../templates/tag-index.js";
import config from "../site.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT_DIR, "content");
const OUTPUT_DIR = path.join(ROOT_DIR, "docs");
const ASSETS_DIR = path.join(OUTPUT_DIR, "assets");
const IMAGES_SRC_DIR = path.join(CONTENT_DIR, "images");
const IMAGES_DEST_DIR = path.join(ASSETS_DIR, "images");

// Configure custom image renderer for responsive images
const renderer = new marked.Renderer();
renderer.image = function (href, title, text) {
  // Handle the new marked signature where href is an object
  if (typeof href === "object") {
    text = href.text || "";
    title = href.title || "";
    href = href.href || "";
  }
  return generateResponsiveHTML(href, text || title || "");
};
marked.use({ renderer });

async function buildCSS() {
  console.log("Building CSS with Tailwind...");
  const inputCSS = path.join(ROOT_DIR, "src", "styles.css");
  const outputCSS = path.join(ASSETS_DIR, "styles.css");

  await ensureDir(ASSETS_DIR);

  execSync(`npx tailwindcss -i "${inputCSS}" -o "${outputCSS}" --minify`, {
    cwd: ROOT_DIR,
    stdio: "inherit"
  });
}

async function copyFavicon() {
  console.log("Copying favicon...");
  const inputFavicon = path.join(ROOT_DIR, "src", "favicon.svg");
  const outputFavicon = path.join(ASSETS_DIR, "favicon.svg");

  await ensureDir(ASSETS_DIR);
  await fs.copyFile(inputFavicon, outputFavicon);
  console.log("  Created: assets/favicon.svg");
}

async function copyCNAME() {
  console.log("Copying CNAME...");
  const inputCNAME = path.join(ROOT_DIR, "src", "CNAME");
  const outputCNAME = path.join(OUTPUT_DIR, "CNAME");

  await fs.copyFile(inputCNAME, outputCNAME);
  console.log("  Created: CNAME");
}

async function parseMarkdownFile(filePath) {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const htmlContent = marked(content);

  return {
    frontMatter: data,
    content: htmlContent,
    rawContent: content
  };
}

async function buildPages() {
  console.log("Building pages...");
  const pagesDir = path.join(CONTENT_DIR, "pages");
  const pageFiles = await getFiles(pagesDir);

  for (const filePath of pageFiles) {
    const { frontMatter, content } = await parseMarkdownFile(filePath);
    const slug = getSlugFromFilename(filePath);

    const html = renderPage({
      title: frontMatter.title,
      content,
      slug
    });

    let outputPath;
    if (slug === "index") {
      outputPath = path.join(OUTPUT_DIR, "index.html");
    } else if (slug === "404") {
      // GitHub Pages expects 404.html at the root
      outputPath = path.join(OUTPUT_DIR, "404.html");
    } else {
      const pageDir = path.join(OUTPUT_DIR, slug);
      await ensureDir(pageDir);
      outputPath = path.join(pageDir, "index.html");
    }

    await fs.writeFile(outputPath, html);
    console.log(`  Created: ${path.relative(OUTPUT_DIR, outputPath)}`);
  }
}

async function buildBlogPosts() {
  console.log("Building blog posts...");
  const blogDir = path.join(CONTENT_DIR, "blog");
  const postFiles = await getFiles(blogDir);

  const posts = [];

  for (const filePath of postFiles) {
    const { frontMatter, content } = await parseMarkdownFile(filePath);

    // Skip draft posts
    if (frontMatter.draft === true) {
      console.log(`  Skipping draft: ${path.basename(filePath)}`);
      continue;
    }

    const slug = getSlugFromFilename(filePath);

    posts.push({
      title: frontMatter.title || "Untitled",
      date: frontMatter.date || new Date().toISOString(),
      excerpt: frontMatter.excerpt || "",
      tags: frontMatter.tags || [],
      slug,
      content
    });

    // Generate individual post page
    const html = renderPost({
      title: frontMatter.title,
      date: frontMatter.date,
      content,
      tags: frontMatter.tags,
      slug
    });

    const postDir = path.join(OUTPUT_DIR, "blog", slug);
    await ensureDir(postDir);
    const outputPath = path.join(postDir, "index.html");

    await fs.writeFile(outputPath, html);
    console.log(`  Created: ${path.relative(OUTPUT_DIR, outputPath)}`);
  }

  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return posts;
}

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function buildRSS(posts) {
  console.log("Building RSS feed...");

  const siteUrl = config.siteUrl || "https://example.com";
  const feedUrl = `${siteUrl}/feed.xml`;

  const items = posts.map((post) => {
    const postUrl = `${siteUrl}/blog/${post.slug}/`;
    const pubDate = new Date(post.date).toUTCString();

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(config.siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`;

  const outputPath = path.join(OUTPUT_DIR, "feed.xml");
  await fs.writeFile(outputPath, rss);
  console.log(`  Created: ${path.relative(OUTPUT_DIR, outputPath)}`);
}

async function buildBlogIndex(posts) {
  console.log("Building blog index with pagination...");
  const postsPerPage = config.postsPerPage || 5;
  const totalPages = Math.ceil(posts.length / postsPerPage) || 1;

  for (let page = 1; page <= totalPages; page++) {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const pagePosts = posts.slice(startIndex, endIndex);

    const html = renderBlogList({
      posts: pagePosts,
      currentPage: page,
      totalPages
    });

    let outputPath;
    if (page === 1) {
      const blogDir = path.join(OUTPUT_DIR, "blog");
      await ensureDir(blogDir);
      outputPath = path.join(blogDir, "index.html");
    } else {
      const pageDir = path.join(OUTPUT_DIR, "blog", "page", String(page));
      await ensureDir(pageDir);
      outputPath = path.join(pageDir, "index.html");
    }

    await fs.writeFile(outputPath, html);
    console.log(`  Created: ${path.relative(OUTPUT_DIR, outputPath)}`);
  }
}

function collectTags(posts) {
  console.log("Collecting tags from posts...");
  const tagMap = new Map();

  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        const slug = slugify(tag);
        if (tagMap.has(slug)) {
          tagMap.get(slug).count++;
        } else {
          tagMap.set(slug, { tag, slug, count: 1 });
        }
      });
    }
  });

  // Sort by count (descending), then alphabetically
  const tags = Array.from(tagMap.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.tag.localeCompare(b.tag);
  });

  console.log(`  Found ${tags.length} unique tags`);
  return tags;
}

async function buildTagArchives(posts, tags) {
  console.log("Building tag archives...");
  const postsPerPage = config.postsPerPage || 5;

  for (const { tag, slug, count } of tags) {
    // Filter posts that have this tag
    const tagPosts = posts.filter(post =>
      post.tags && post.tags.some(t => slugify(t) === slug)
    );

    // Calculate pagination
    const totalPages = Math.ceil(tagPosts.length / postsPerPage) || 1;

    // Generate pages for this tag
    for (let page = 1; page <= totalPages; page++) {
      const startIndex = (page - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const pagePosts = tagPosts.slice(startIndex, endIndex);

      const html = renderTagArchive({
        tag,
        slug,
        posts: pagePosts,
        currentPage: page,
        totalPages
      });

      let outputPath;
      if (page === 1) {
        const tagDir = path.join(OUTPUT_DIR, "blog", "tags", slug);
        await ensureDir(tagDir);
        outputPath = path.join(tagDir, "index.html");
      } else {
        const pageDir = path.join(OUTPUT_DIR, "blog", "tags", slug, "page", String(page));
        await ensureDir(pageDir);
        outputPath = path.join(pageDir, "index.html");
      }

      await fs.writeFile(outputPath, html);
      console.log(`  Created: ${path.relative(OUTPUT_DIR, outputPath)}`);
    }
  }
}

async function buildTagIndex(tags) {
  console.log("Building tag index...");

  const html = renderTagIndex({ tags });

  const tagIndexDir = path.join(OUTPUT_DIR, "blog", "tags");
  await ensureDir(tagIndexDir);
  const outputPath = path.join(tagIndexDir, "index.html");

  await fs.writeFile(outputPath, html);
  console.log(`  Created: ${path.relative(OUTPUT_DIR, outputPath)}`);
}

async function build() {
  console.log("Starting build...\n");

  // Clean output directory
  await cleanDir(OUTPUT_DIR);

  // Process images (must be done before markdown parsing)
  await processAllImages(IMAGES_SRC_DIR, IMAGES_DEST_DIR);
  console.log("");

  // Build CSS
  await buildCSS();
  console.log("");

  // Copy favicon
  await copyFavicon();
  console.log("");

  // Copy CNAME for GitHub Pages custom domain
  await copyCNAME();
  console.log("");

  // Build pages
  await buildPages();
  console.log("");

  // Build blog posts and get sorted list
  const posts = await buildBlogPosts();
  console.log("");

  // Build blog index with pagination
  await buildBlogIndex(posts);
  console.log("");

  // Build tag archives
  const tags = collectTags(posts);
  await buildTagArchives(posts, tags);
  console.log("");

  // Build tag index
  await buildTagIndex(tags);
  console.log("");

  // Build RSS feed
  await buildRSS(posts);
  console.log("");

  console.log("Build complete!");
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
