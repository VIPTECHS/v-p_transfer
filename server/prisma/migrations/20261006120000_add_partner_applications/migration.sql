-- CreateTable
CREATE TABLE "PartnerApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "countryCity" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyType" TEXT NOT NULL,
    "companyTypeOther" TEXT,
    "monthlyVolume" TEXT NOT NULL,
    "destinations" TEXT NOT NULL,
    "workPreference" TEXT NOT NULL,
    "workPreferenceOther" TEXT,
    "notes" TEXT,
    "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "privacyAcceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PartnerApplication_status_idx" ON "PartnerApplication"("status");

-- CreateIndex
CREATE INDEX "PartnerApplication_createdAt_idx" ON "PartnerApplication"("createdAt");
