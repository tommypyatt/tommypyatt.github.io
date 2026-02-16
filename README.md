# Personal Website & Blog

A personal website and blog built with a custom Node.js static site generator. Features Markdown content authoring, EJS templating, Tailwind CSS styling, and Alpine.js interactivity (bundled locally, no CDN dependencies at runtime).

## Quickstart

```bash
# Install dependencies
npm install

# Build the site
npm run build

# Preview locally
npm run serve
```

The built site will be in the `docs/` folder. Open `http://localhost:3000` to preview.

## Development

For development with auto-rebuild on file changes:

```bash
npm run dev
```

This watches for changes in:
- `content/**/*.md` - Markdown content
- `templates/**/*.ejs` - EJS templates
- `src/**/*.css` - Styles
- `site.config.js` - Site configuration

In a separate terminal, run `npm run serve` to preview changes.

## Project Structure

```
├── content/
│   ├── pages/          # Standalone pages (index.md, about.md, etc.)
│   └── blog/           # Blog posts
├── templates/          # EJS templates
│   ├── layouts/        # Base layout template
│   ├── partials/       # Reusable template components (header, footer)
│   ├── page.ejs        # Page template
│   ├── post.ejs        # Blog post template
│   └── blog-list.ejs   # Blog listing with pagination
├── scripts/            # Build scripts
├── src/
│   ├── styles.css      # Tailwind CSS source
│   ├── icons/          # SVG icon files
│   ├── favicon.svg     # Site favicon
│   └── CNAME           # Custom domain for GitHub Pages
├── docs/               # Built site (GitHub Pages)
│   └── feed.xml        # RSS feed (auto-generated)
└── site.config.js      # Site configuration
```

## Deploying to GitHub Pages

1. Build the site:
   ```bash
   npm run build
   ```

2. Commit and push the `docs/` folder to your repository

3. In GitHub repository settings:
   - Go to **Settings > Pages**
   - Set **Source** to "Deploy from a branch"
   - Set **Branch** to `main` and folder to `/docs`
   - Click Save

4. If deploying to a project page (not `username.github.io`), update `baseUrl` in `site.config.js`:
   ```javascript
   baseUrl: "/your-repo-name"
   ```

### Custom Domain

To use a custom domain, edit `src/CNAME` with your domain:

```
yourdomain.com
```

The CNAME file is automatically copied to `docs/` during each build. Configure your DNS settings as per [GitHub's custom domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Adding & Editing Content

### Adding a New Page

Create a markdown file in `content/pages/`:

```markdown
---
title: My Page Title
---

# My Page

Content here...
```

The page will be available at `/<filename>/` (e.g., `contact.md` → `/contact/`).

To add it to the navigation, edit `site.config.js`:

```javascript
navLinks: [
  { label: "Home", type: "page", slug: "" },
  { label: "About", type: "page", slug: "about" },
  { label: "Contact", type: "page", slug: "contact" },  // Add this
  { label: "Blog", type: "blog", slug: "blog" }
]
```

### Adding a Blog Post

Create a markdown file in `content/blog/`:

```markdown
---
title: My Post Title
date: 2024-03-15
excerpt: A short description shown in the blog listing
tags:
  - javascript
  - tutorials
---

Post content here...
```

Front matter fields:
- `title` (required): Post title
- `date` (required): ISO date string (YYYY-MM-DD)
- `excerpt` (required): Short description for blog listing
- `tags` (optional): Array of tag strings
- `draft` (optional): Set to `true` to exclude from build

### Hiding a Draft Post

Add `draft: true` to the front matter:

```markdown
---
title: Work in Progress
date: 2024-03-20
excerpt: Coming soon
draft: true
---
```

To publish, remove the `draft` line or change it to `draft: false`.

### Adding Images

Images are automatically optimized during build. The system generates multiple sizes and WebP versions for better performance.

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
- Generates responsive sizes (400w, 800w, 1200w by default)
- Creates WebP versions alongside originals
- Outputs optimized images to `docs/assets/images/`
- Replaces markdown images with `<picture>` elements containing `srcset`

## Customisation

### Site Title & Metadata

Edit `site.config.js`:

```javascript
export default {
  siteTitle: "Your Site Name",
  siteDescription: "Your site description",
  author: "Your Name",
  // ...
}
```

### Navigation

Edit the `navLinks` array in `site.config.js`:

```javascript
navLinks: [
  { label: "Home", type: "page", slug: "" },
  { label: "About", type: "page", slug: "about" },
  { label: "Blog", type: "blog", slug: "blog" }
]
```

### Blog Pagination

Change the number of posts per page:

```javascript
postsPerPage: 10
```

### Blog Intro Text

Customise the introductory text shown at the top of the blog listing page:

```javascript
blogIntro: "My thoughts, ideas and updates. Updated infrequently. Probably."
```

### Image Processing

Configure responsive image generation:

```javascript
images: {
  sizes: [400, 800, 1200],  // Widths to generate
  quality: 80               // WebP/JPEG quality (1-100)
}
```

### RSS Feed

An RSS feed is automatically generated at `/feed.xml` during each build. The feed includes all published (non-draft) blog posts sorted by date.

The feed uses the `siteUrl` setting from `site.config.js` for absolute URLs:

```javascript
siteUrl: "https://yourdomain.com"
```

Feed details:
- **Location**: `docs/feed.xml` (available at `/feed.xml`)
- **Format**: RSS 2.0 with Atom namespace
- **Content**: Post title, link, excerpt, and publication date
- **Updates**: Regenerated on every build with current timestamp

To let visitors discover your feed, you can link to it from your site or add it to feed directories.

### Social Links

Add social media links to the footer by configuring `socialLinks` in `site.config.js`:

```javascript
socialLinks: {
  linkedin: "https://linkedin.com/in/yourprofile",
  github: "https://github.com/yourusername",
  twitter: "https://twitter.com/yourhandle",
  medium: "https://medium.com/@yourhandle",
  // Email is obfuscated in the page - use base64 encoded value
  // To encode: btoa("your@email.com") in browser console
  email: "eW91ckBlbWFpbC5jb20=" // base64 encoded email address
}
```

To hide a social link, remove it from the object or set it to `null`. To hide all social links, set `socialLinks` to `null`.

### Styling

Edit `src/styles.css` for global styles. The site uses Tailwind CSS - edit EJS templates in `templates/` to change component styles.

To customise Tailwind, edit `tailwind.config.js`.

### Icons

Social media and UI icons are stored as individual SVG files in `src/icons/`. The build process reads these files and inlines them into the templates during the build. To add or modify icons, edit the SVG files in `src/icons/`.

### Colors

The site uses semantic color tokens defined in `tailwind.config.js`. This makes it easy to change the color scheme from a single location.

**Changing the accent color:**

To change the primary accent color (used for links, buttons, tags, etc.), edit the `primary` color in `tailwind.config.js`:

```javascript
import colors from "tailwindcss/colors";

export default {
  theme: {
    extend: {
      colors: {
        // Change from cyan to any Tailwind color palette
        primary: colors.blue,      // Blue theme
        primary: colors.emerald,   // Green theme
        primary: colors.violet,    // Purple theme
        primary: colors.rose,      // Pink theme
        // ...
      }
    }
  }
}
```

**Available color tokens:**

| Token | Purpose | Default |
|-------|---------|---------|
| `primary` | Accent color for links, interactive elements | `colors.cyan` |
| `background` | Main page background | `gray-950` |
| `background-surface` | Header, footer, cards | `gray-900` |
| `background-elevated` | Hover states, code blocks, tags | `gray-800` |
| `foreground` | Body text | `gray-300` |
| `foreground-heading` | Headings, strong emphasis | `gray-100` |
| `foreground-muted` | Secondary text, excerpts | `gray-400` |
| `foreground-subtle` | Timestamps, placeholders | `gray-500` |
| `foreground-disabled` | Disabled states | `gray-600` |
| `border` | Standard borders | `gray-700` |
| `border-subtle` | Subtle dividers | `gray-800` |

**Custom colors:**

You can also define custom colors instead of using Tailwind's built-in palettes:

```javascript
colors: {
  primary: {
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
  },
  background: {
    DEFAULT: '#0a0a0a',
    surface: '#141414',
    elevated: '#1e1e1e',
  },
  // ...
}
```

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Clean and build the site |
| `npm run dev` | Build and watch for changes |
| `npm run clean` | Remove the `docs/` directory |
| `npm run serve` | Serve the built site locally |

## License

MIT
