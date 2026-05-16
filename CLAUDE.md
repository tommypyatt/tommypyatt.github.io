# CLAUDE.md - Project Documentation

This document serves as the authoritative specification for this personal website and blog project.

## Project Overview

A personal website and blog built with a custom Node.js-based static site generator. The site uses Markdown for content authoring, Tailwind CSS for styling, and Alpine.js for interactivity. The output is a fully static site designed for GitHub Pages deployment.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Static Site Generator**: Custom Node.js scripts (not an off-the-shelf SSG)
- **Content**: Markdown files with YAML front matter
- **Templating**: EJS (Embedded JavaScript templates)
- **Styling**: Tailwind CSS (compiled to a single CSS file)
- **Interactivity**: Alpine.js (bundled locally from node_modules)
- **Markdown Parsing**: gray-matter (front matter) + marked (markdown to HTML)
- **Image Processing**: Sharp (responsive images with WebP support)
- **Hosting**: GitHub Pages (from `docs/` folder)

## Directory Structure

```
claude-site/
├── content/                   # All markdown content
│   ├── pages/                 # Standalone pages
│   │   ├── index.md           # Homepage
│   │   └── about.md           # About page
│   ├── blog/                  # Blog posts
│   │   └── *.md               # Individual posts
│   └── images/                # Source images (auto-optimized)
│       └── *.{jpg,png,webp}   # Images referenced in markdown
├── templates/                 # EJS templates
│   ├── layouts/               # Layout templates
│   │   └── base.ejs           # Base layout with header/footer/nav
│   ├── partials/              # Reusable template components
│   │   ├── header.ejs         # Site header with navigation
│   │   └── footer.ejs         # Site footer with social links
│   ├── page.ejs               # Page template
│   ├── post.ejs               # Blog post template
│   └── blog-list.ejs          # Blog listing with pagination
├── scripts/                   # Build scripts
│   ├── build.js               # Main build script
│   ├── dev.js                 # Development watcher
│   ├── clean.js               # Output directory cleaner
│   ├── imageOptimizer.js      # Image processing (responsive + WebP)
│   └── utils.js               # Utility functions
├── src/                       # Source assets
│   ├── styles.css             # Tailwind CSS entry point
│   ├── icons/                 # SVG icon files
│   ├── favicon.svg            # Site favicon
│   └── CNAME                  # Custom domain file for GitHub Pages
├── docs/                      # Build output (GitHub Pages)
│   ├── index.html             # Built homepage
│   ├── about/index.html       # Built about page
│   ├── blog/                  # Blog section
│   │   ├── index.html         # Blog listing (page 1)
│   │   ├── page/2/index.html  # Blog listing (page 2, etc.)
│   │   └── [slug]/index.html  # Individual post pages
│   ├── assets/
│   │   ├── styles.css         # Compiled Tailwind CSS
│   │   └── images/            # Processed responsive images
│   └── feed.xml               # RSS feed
├── site.config.js             # Site configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── package.json               # Dependencies and scripts
├── CLAUDE.md                  # This file
└── README.md                  # User-facing documentation
```

## Static Site Generation Process

### 1. Markdown Discovery

The build script discovers markdown files in two locations:
- `content/pages/*.md` - Standalone pages
- `content/blog/*.md` - Blog posts

Files are found recursively using the `getFiles()` utility function.

### 2. Front Matter Parsing

Each markdown file is parsed using `gray-matter` to extract:
- YAML front matter (metadata)
- Markdown body content

**Page front matter:**
```yaml
---
title: Page Title
---
```

**Blog post front matter:**
```yaml
---
title: Post Title
date: 2024-01-15
excerpt: A short description for the blog listing
tags:
  - javascript
  - web development
draft: false
---
```

### 3. HTML Generation

The build script:
1. Converts markdown to HTML using `marked`
2. Passes content and metadata to EJS templates
3. Templates wrap content in the shared layout with header/footer
4. Writes HTML files to `docs/`

### 4. Output Structure

- **Pages**: `content/pages/index.md` → `docs/index.html`
- **Pages**: `content/pages/about.md` → `docs/about/index.html`
- **Blog posts**: `content/blog/my-post.md` → `docs/blog/my-post/index.html`
- **Blog listing**: Generated at `docs/blog/index.html`
- **Pagination**: `docs/blog/page/2/index.html`, etc.

### 5. CSS Building

Tailwind CSS is compiled via PostCSS:
- Input: `src/styles.css`
- Output: `docs/assets/styles.css`
- CSS is minified in production builds
- Unused utilities are purged based on template content

## Pagination

Blog pagination is configured in `site.config.js`:

```javascript
postsPerPage: 5
```

The build process:
1. Sorts posts by date (newest first)
2. Excludes posts with `draft: true`
3. Splits posts into pages of `postsPerPage` each
4. Generates index pages:
   - Page 1: `docs/blog/index.html`
   - Page 2+: `docs/blog/page/[n]/index.html`
5. Adds "Newer posts" / "Older posts" navigation links

## Navigation Configuration

Navigation is defined in `site.config.js`:

```javascript
navLinks: [
  { label: "Home", type: "page", slug: "" },
  { label: "About", type: "page", slug: "about" },
  { label: "Blog", type: "blog", slug: "blog" }
]
```

The layout template:
- Renders navigation from this config
- Highlights the current page
- Shows desktop nav inline
- Shows mobile nav via hamburger menu (Alpine.js toggle)

## Content Writing Guidelines

- Do not use em dashes (—) in any content written for this site. They read as AI-generated. Use commas, parentheses, or rewrite the sentence instead.

## Guidelines for Common Tasks

### Adding a New Page

1. Create a new `.md` file in `content/pages/`:
   ```markdown
   ---
   title: My New Page
   ---

   # My New Page

   Content here...
   ```

2. (Optional) Add to navigation in `site.config.js`:
   ```javascript
   navLinks: [
     // ...existing links
     { label: "New Page", type: "page", slug: "new-page" }
   ]
   ```

3. Run `npm run build`

The page will be available at `/new-page/`.

### Adding a New Blog Post

1. Create a new `.md` file in `content/blog/`:
   ```markdown
   ---
   title: My New Post
   date: 2024-03-15
   excerpt: A short description for listings
   tags:
     - topic1
     - topic2
   ---

   Post content here...
   ```

2. Run `npm run build`

The post will appear in the blog listing and be available at `/blog/my-new-post/`.

### Adding Images to Posts

Images are automatically optimized during build. The system generates multiple sizes (400w, 800w, 1200w) and WebP versions for better performance.

1. Place images in `content/images/`:
   ```
   content/images/my-photo.jpg
   ```

2. Reference in markdown using the `/images/` path:
   ```markdown
   ![Description of image](/images/my-photo.jpg)
   ```

3. Run `npm run build`

The build process:
- Generates responsive sizes: `my-photo-400w.jpg`, `my-photo-800w.webp`, etc.
- Outputs to `docs/assets/images/`
- Replaces markdown images with `<picture>` elements containing `srcset`

### Hiding/Unhiding Posts with Draft

To hide a post from the published site:
```yaml
---
title: My Draft
draft: true
---
```

To publish it, either:
- Change `draft: true` to `draft: false`
- Remove the `draft` line entirely (defaults to `false`)

### Changing Navigation Items

Edit the `navLinks` array in `site.config.js`:

```javascript
navLinks: [
  { label: "Home", type: "page", slug: "" },
  { label: "About", type: "page", slug: "about" },
  { label: "Blog", type: "blog", slug: "blog" },
  { label: "New Section", type: "page", slug: "new-section" }
]
```

- `label`: Display text in navigation
- `type`: Either `"page"` or `"blog"`
- `slug`: URL path (empty string for home)

### Adjusting Blog Pagination

Edit `postsPerPage` in `site.config.js`:

```javascript
postsPerPage: 10  // Show 10 posts per page instead of 5
```

### Configuring Image Processing

Edit the `images` object in `site.config.js`:

```javascript
images: {
  sizes: [400, 800, 1200],  // Widths to generate
  quality: 80               // WebP/JPEG quality (1-100)
}
```

### Changing Site Title and Metadata

Edit the top of `site.config.js`:

```javascript
export default {
  siteTitle: "Your Site Title",
  siteDescription: "Your site description",
  author: "Your Name",
  // ...
}
```

### Configuring for GitHub Pages Project Site

If deploying to `https://username.github.io/repo-name/`:

```javascript
baseUrl: "/repo-name"
```

For root domain (`https://username.github.io/`):

```javascript
baseUrl: ""
```

## Design Decisions and Simplifications

### Template System

The project uses EJS (Embedded JavaScript) for templating. EJS provides a good balance between power and simplicity, with minimal syntax overhead. Templates are organized into:
- **Layouts** (`layouts/base.ejs`): Main page structure shared across all pages
- **Partials** (`partials/`): Reusable components like header and footer
- **Page templates**: Specific templates for pages, posts, and blog listings

This structure keeps templates modular and maintainable while avoiding the complexity of a full framework.

### Icon System

Social media and UI icons are stored as individual SVG files in `src/icons/`. During the build process, these SVG files are read and inlined into the templates. This approach provides:
- Easy icon management and editing
- No external icon library dependencies
- Optimal performance with inline SVGs
- Full control over icon styling via CSS

### No Separate Blog Index Markdown

The blog listing page is generated purely from blog post metadata rather than requiring a separate `blog.md` file. This reduces redundancy since the listing content is dynamic.

### Slug Generation

Slugs are derived from filenames using simple slugification (lowercase, replace non-alphanumeric with hyphens). For example:
- `My First Post.md` → `my-first-post`
- `getting-started.md` → `getting-started`

### CSS Approach

A single compiled CSS file is used rather than per-page CSS. Tailwind's purge mechanism keeps the file small by removing unused utilities.

### Alpine.js Bundled Locally

Alpine.js is installed as an npm dependency and copied from `node_modules/alpinejs/dist/cdn.min.js` to `docs/assets/alpine.min.js` during the build. The `defer` attribute ensures it loads without blocking page rendering. This avoids external CDN dependencies at runtime.

## Future Extension Points

### Tags Pages

Generate tag archive pages by:
1. Collecting all unique tags across posts
2. Filtering posts by tag
3. Generating `docs/blog/tags/[tag]/index.html` pages

### Search

Add client-side search by:
1. Generating a `search-index.json` during build
2. Using Alpine.js to filter posts based on the index

### Syntax Highlighting

Add code syntax highlighting by:
1. Installing `highlight.js` or `prism.js`
2. Configuring the marked renderer to use it
3. Adding the CSS theme to the build

## Troubleshooting

### Build Fails with "Cannot find module"

Run `npm install` to ensure all dependencies are installed.

### CSS Changes Not Appearing

1. Clear the browser cache
2. Run a clean build: `npm run clean && npm run build`
3. Ensure Tailwind's content config includes your templates

### Pages Not Showing in Navigation

Ensure the page is added to `navLinks` in `site.config.js` and the slug matches the markdown filename.

### Posts Not Appearing

Check that:
1. The file is in `content/blog/`
2. The file has `.md` extension
3. `draft` is not set to `true` in front matter
4. The `date` field is a valid ISO date string
