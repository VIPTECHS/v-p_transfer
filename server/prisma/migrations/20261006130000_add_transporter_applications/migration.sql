-- CreateTable
CREATE TABLE "TransporterApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "onlinePresence" TEXT,
    "countryCity" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "serviceRegions" TEXT NOT NULL,
    "vehicleTypes" TEXT NOT NULL,
    "vehicleCount" TEXT NOT NULL,
    "offers24h" BOOLEAN NOT NULL,
    "offersFixedB2bPrice" BOOLEAN NOT NULL,
    "notes" TEXT,
    "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "privacyAcceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "TransporterApplication_status_idx" ON "TransporterApplication"("status");

-- CreateIndex
CREATE INDEX "TransporterApplication_createdAt_idx" ON "TransporterApplication"("createdAt");
