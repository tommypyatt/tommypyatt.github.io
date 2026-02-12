import { layout, resolveUrl } from "./layout.js";
import { renderPostCard } from "./shared.js";

function renderPagination({ currentPage, totalPages, tagSlug }) {
  if (totalPages <= 1) return "";

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const prevUrl = prevPage === 1
    ? resolveUrl(`/blog/tags/${tagSlug}/`)
    : prevPage ? resolveUrl(`/blog/tags/${tagSlug}/page/${prevPage}/`) : null;

  const nextUrl = nextPage ? resolveUrl(`/blog/tags/${tagSlug}/page/${nextPage}/`) : null;

  return `
    <nav class="flex justify-between items-center pt-8 border-t border-border-subtle" aria-label="Tag archive pagination">
      <div>
        ${prevUrl
          ? `<a href="${prevUrl}" class="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Newer posts
            </a>`
          : `<span class="text-foreground-disabled">Newer posts</span>`
        }
      </div>
      <span class="text-foreground-subtle text-sm">Page ${currentPage} of ${totalPages}</span>
      <div>
        ${nextUrl
          ? `<a href="${nextUrl}" class="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Older posts
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>`
          : `<span class="text-foreground-disabled">Older posts</span>`
        }
      </div>
    </nav>
  `;
}

export function renderTagArchive({ tag, slug, posts, currentPage, totalPages }) {
  const postsHtml = posts.map(renderPostCard).join("");

  const pageContent = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header class="mb-10">
        <nav class="text-sm mb-4" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2 text-foreground-subtle">
            <li><a href="${resolveUrl("/blog/")}" class="hover:text-primary-400 transition-colors">Blog</a></li>
            <li><span class="text-foreground-disabled">/</span></li>
            <li><a href="${resolveUrl("/blog/tags/")}" class="hover:text-primary-400 transition-colors">Tags</a></li>
            <li><span class="text-foreground-disabled">/</span></li>
            <li class="text-foreground" aria-current="page">${tag}</li>
          </ol>
        </nav>
        <h1 class="text-3xl md:text-4xl font-bold text-foreground-heading mb-4">
          Posts tagged with "${tag}"
        </h1>
        <p class="text-foreground-muted">${posts.length} ${posts.length === 1 ? 'post' : 'posts'} on this page</p>
      </header>

      <div class="space-y-0">
        ${postsHtml || `<p class="text-foreground-subtle">No posts found with this tag.</p>`}
      </div>

      ${renderPagination({ currentPage, totalPages, tagSlug: slug })}
    </div>
  `;

  return layout({
    title: currentPage > 1 ? `${tag} - Page ${currentPage}` : tag,
    content: pageContent,
    currentPath: `blog/tags/${slug}`
  });
}
