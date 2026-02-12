import { resolveUrl } from "./layout.js";

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function renderPostCard({ title, date, excerpt, slug, tags }) {
  const formattedDate = formatDate(date);

  const tagsHtml = tags && tags.length > 0
    ? `<div class="flex flex-wrap gap-2 mb-3">
        ${tags.map(tag => {
          const tagSlug = slugify(tag);
          return `<a href="${resolveUrl(`/blog/tags/${tagSlug}/`)}" class="px-2 py-0.5 bg-background-elevated text-primary-400 text-xs rounded-full border border-border hover:bg-primary-400 hover:text-background-elevated transition-colors">${tag}</a>`;
        }).join("")}
      </div>`
    : "";

  return `
    <article class="border-b border-border-subtle pb-8 mb-8 last:border-b-0 last:pb-0 last:mb-0">
      <p class="text-foreground-subtle text-sm mb-2">
        <time datetime="${date}">${formattedDate}</time>
      </p>
      <h2 class="text-xl md:text-2xl font-semibold text-foreground-heading mb-3">
        <a href="${resolveUrl(`/blog/${slug}/`)}" class="hover:text-primary-400 transition-colors">
          ${title}
        </a>
      </h2>
      ${tagsHtml}
      <p class="text-foreground-muted mb-4">${excerpt}</p>
      <a href="${resolveUrl(`/blog/${slug}/`)}" class="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium transition-colors" aria-label="Read more: ${title}">
        Read more
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </article>
  `;
}
