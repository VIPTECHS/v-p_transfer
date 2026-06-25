-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "address" TEXT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agency_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pickupAt" DATETIME NOT NULL,
    "fromLabel" TEXT NOT NULL,
    "toLabel" TEXT,
    "durationHours" INTEGER,
    "fromLng" REAL,
    "fromLat" REAL,
    "toLng" REAL,
    "toLat" REAL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passengers" INTEGER NOT NULL DEFAULT 1,
    "luggage" INTEGER NOT NULL DEFAULT 0,
    "childSeat" INTEGER NOT NULL DEFAULT 0,
    "vehicle" TEXT,
    "notes" TEXT,
    "flightNumber" TEXT,
    "meetAndGreetName" TEXT,
    "returnTransfer" BOOLEAN NOT NULL DEFAULT false,
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "quotedPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "priceNotes" TEXT,
    "lastNotifiedAt" DATETIME,
    "notificationStatus" TEXT NOT NULL DEFAULT 'none',
    "assignedDriverId" TEXT,
    "assignedVehicleId" TEXT,
    "cityId" TEXT,
    "agencyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_assignedVehicleId_fkey" FOREIGN KEY ("assignedVehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("assignedDriverId", "assignedVehicleId", "childSeat", "createdAt", "currency", "durationHours", "email", "firstName", "flightNumber", "fromLabel", "fromLat", "fromLng", "id", "lastName", "lastNotifiedAt", "luggage", "meetAndGreetName", "notes", "notificationStatus", "passengers", "paymentStatus", "phone", "pickupAt", "priceNotes", "quotedPrice", "reference", "returnTransfer", "status", "toLabel", "toLat", "toLng", "type", "updatedAt", "vehicle") SELECT "assignedDriverId", "assignedVehicleId", "childSeat", "createdAt", "currency", "durationHours", "email", "firstName", "flightNumber", "fromLabel", "fromLat", "fromLng", "id", "lastName", "lastNotifiedAt", "luggage", "meetAndGreetName", "notes", "notificationStatus", "passengers", "paymentStatus", "phone", "pickupAt", "priceNotes", "quotedPrice", "reference", "returnTransfer", "status", "toLabel", "toLat", "toLng", "type", "updatedAt", "vehicle" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");
CREATE INDEX "Booking_pickupAt_idx" ON "Booking"("pickupAt");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");
CREATE INDEX "Booking_cityId_idx" ON "Booking"("cityId");
CREATE INDEX "Booking_agencyId_idx" ON "Booking"("agencyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "City"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_countryId_key" ON "City"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_username_key" ON "Agency"("username");

-- CreateIndex
CREATE INDEX "Agency_cityId_idx" ON "Agency"("cityId");
