-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "whatsapp" TEXT;

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "District_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "districtId" TEXT,
    "cityId" TEXT,
    "lat" REAL,
    "lng" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Location_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Location_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "branch" TEXT,
    "iban" TEXT NOT NULL,
    "swift" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "paymentTermDays" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EntityDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "docNumber" TEXT,
    "issuedAt" DATETIME,
    "expiresAt" DATETIME,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reservationId" TEXT,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "description" TEXT,
    "entryDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LedgerEntry_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "countryId" TEXT,
    "districtId" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactWhatsapp" TEXT,
    "contactEmail" TEXT,
    "address" TEXT,
    "invoiceTitle" TEXT,
    "taxOffice" TEXT,
    "taxNumber" TEXT,
    "invoiceAddress" TEXT,
    "invoiceEmail" TEXT,
    "commissionRate" REAL,
    "commissionType" TEXT DEFAULT 'percentage',
    "commissionCurrency" TEXT DEFAULT 'EUR',
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agency_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agency_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Agency_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Agency" ("address", "cityId", "contactName", "createdAt", "email", "id", "isActive", "name", "passwordHash", "phone", "updatedAt", "username", "webhookUrl") SELECT "address", "cityId", "contactName", "createdAt", "email", "id", "isActive", "name", "passwordHash", "phone", "updatedAt", "username", "webhookUrl" FROM "Agency";
DROP TABLE "Agency";
ALTER TABLE "new_Agency" RENAME TO "Agency";
CREATE UNIQUE INDEX "Agency_username_key" ON "Agency"("username");
CREATE INDEX "Agency_cityId_idx" ON "Agency"("cityId");
CREATE INDEX "Agency_countryId_idx" ON "Agency"("countryId");
CREATE INDEX "Agency_districtId_idx" ON "Agency"("districtId");
CREATE TABLE "new_Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "supplierId" TEXT,
    "agencyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Driver_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Driver_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Driver" ("createdAt", "email", "id", "isActive", "name", "phone", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "name", "phone", "updatedAt" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
CREATE INDEX "Driver_supplierId_idx" ON "Driver"("supplierId");
CREATE INDEX "Driver_agencyId_idx" ON "Driver"("agencyId");
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "sourceLabel" TEXT,
    "bookingId" TEXT,
    "agencyId" TEXT,
    "supplierId" TEXT,
    "supplierPrice" REAL,
    "supplierCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "supplierPaymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "supplierPaymentType" TEXT,
    "supplierPaymentDate" DATETIME,
    "supplierNote" TEXT,
    "customerId" TEXT,
    "salePrice" REAL,
    "saleCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "customerPaymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "customerPaymentType" TEXT,
    "customerPaymentDate" DATETIME,
    "customerNote" TEXT,
    "assignedVehicleId" TEXT,
    "assignedDriverId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_assignedVehicleId_fkey" FOREIGN KEY ("assignedVehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("assignedDriverId", "assignedVehicleId", "bookingId", "createdAt", "customerId", "customerNote", "customerPaymentDate", "customerPaymentStatus", "customerPaymentType", "id", "reference", "saleCurrency", "salePrice", "status", "supplierCurrency", "supplierId", "supplierNote", "supplierPaymentDate", "supplierPaymentStatus", "supplierPaymentType", "supplierPrice", "updatedAt") SELECT "assignedDriverId", "assignedVehicleId", "bookingId", "createdAt", "customerId", "customerNote", "customerPaymentDate", "customerPaymentStatus", "customerPaymentType", "id", "reference", "saleCurrency", "salePrice", "status", "supplierCurrency", "supplierId", "supplierNote", "supplierPaymentDate", "supplierPaymentStatus", "supplierPaymentType", "supplierPrice", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE UNIQUE INDEX "Reservation_reference_key" ON "Reservation"("reference");
CREATE UNIQUE INDEX "Reservation_bookingId_key" ON "Reservation"("bookingId");
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");
CREATE INDEX "Reservation_source_idx" ON "Reservation"("source");
CREATE INDEX "Reservation_createdAt_idx" ON "Reservation"("createdAt");
CREATE INDEX "Reservation_supplierId_idx" ON "Reservation"("supplierId");
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");
CREATE INDEX "Reservation_agencyId_idx" ON "Reservation"("agencyId");
CREATE INDEX "Reservation_bookingId_idx" ON "Reservation"("bookingId");
CREATE TABLE "new_Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "countryId" TEXT,
    "cityId" TEXT,
    "districtId" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactWhatsapp" TEXT,
    "contactEmail" TEXT,
    "invoiceTitle" TEXT,
    "taxOffice" TEXT,
    "taxNumber" TEXT,
    "invoiceAddress" TEXT,
    "invoiceEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplier_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Supplier_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Supplier_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Supplier" ("address", "cityId", "contactName", "createdAt", "email", "id", "isActive", "name", "phone", "updatedAt") SELECT "address", "cityId", "contactName", "createdAt", "email", "id", "isActive", "name", "phone", "updatedAt" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
CREATE INDEX "Supplier_cityId_idx" ON "Supplier"("cityId");
CREATE INDEX "Supplier_countryId_idx" ON "Supplier"("countryId");
CREATE INDEX "Supplier_districtId_idx" ON "Supplier"("districtId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "District_cityId_idx" ON "District"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_cityId_key" ON "District"("name", "cityId");

-- CreateIndex
CREATE INDEX "Location_cityId_idx" ON "Location"("cityId");

-- CreateIndex
CREATE INDEX "Location_districtId_idx" ON "Location"("districtId");

-- CreateIndex
CREATE INDEX "Location_type_idx" ON "Location"("type");

-- CreateIndex
CREATE INDEX "BankAccount_entityType_entityId_idx" ON "BankAccount"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityDocument_entityType_entityId_idx" ON "EntityDocument"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityDocument_expiresAt_idx" ON "EntityDocument"("expiresAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_entityType_entityId_idx" ON "LedgerEntry"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "LedgerEntry_reservationId_idx" ON "LedgerEntry"("reservationId");

-- CreateIndex
CREATE INDEX "LedgerEntry_entryDate_idx" ON "LedgerEntry"("entryDate");

-- Data migration
UPDATE "Reservation" SET "status" = 'confirmed' WHERE "status" = 'pending';
UPDATE "Reservation" SET "source" = 'web' WHERE "bookingId" IS NOT NULL;
