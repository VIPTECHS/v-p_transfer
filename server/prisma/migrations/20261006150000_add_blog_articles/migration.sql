CREATE TABLE "BlogArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "coverImage" TEXT,
    "translations" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "BlogArticle_slug_key" ON "BlogArticle"("slug");
CREATE INDEX "BlogArticle_status_publishedAt_idx" ON "BlogArticle"("status", "publishedAt");
