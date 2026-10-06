-- CreateTable
CREATE TABLE "PolicyContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyContent_slug_language_key" ON "PolicyContent"("slug", "language");

-- CreateIndex
CREATE INDEX "PolicyContent_slug_idx" ON "PolicyContent"("slug");
