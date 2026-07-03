-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "identityNo" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "address" TEXT,
    "cityId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplier_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
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
    CONSTRAINT "Reservation_assignedVehicleId_fkey" FOREIGN KEY ("assignedVehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "flightCode" TEXT,
    "fromLabel" TEXT NOT NULL,
    "toLabel" TEXT NOT NULL,
    "fromLng" REAL,
    "fromLat" REAL,
    "toLng" REAL,
    "toLat" REAL,
    "transferDate" DATETIME NOT NULL,
    "transferTime" TEXT,
    "type" TEXT NOT NULL DEFAULT 'arrival',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transfer_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "identityNumber" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Passenger_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReservationStatusLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReservationStatusLog_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "routedAgencyId" TEXT,
    "routedAt" DATETIME,
    "agencyResponseStatus" TEXT,
    "agencyRespondedAt" DATETIME,
    "agencyDeclineNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_assignedVehicleId_fkey" FOREIGN KEY ("assignedVehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_routedAgencyId_fkey" FOREIGN KEY ("routedAgencyId") REFERENCES "Agency" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("agencyDeclineNote", "agencyId", "agencyRespondedAt", "agencyResponseStatus", "assignedDriverId", "assignedVehicleId", "childSeat", "cityId", "createdAt", "currency", "durationHours", "email", "firstName", "flightNumber", "fromLabel", "fromLat", "fromLng", "id", "lastName", "lastNotifiedAt", "luggage", "meetAndGreetName", "notes", "notificationStatus", "passengers", "paymentStatus", "phone", "pickupAt", "priceNotes", "quotedPrice", "reference", "returnTransfer", "routedAgencyId", "routedAt", "status", "toLabel", "toLat", "toLng", "type", "updatedAt", "vehicle") SELECT "agencyDeclineNote", "agencyId", "agencyRespondedAt", "agencyResponseStatus", "assignedDriverId", "assignedVehicleId", "childSeat", "cityId", "createdAt", "currency", "durationHours", "email", "firstName", "flightNumber", "fromLabel", "fromLat", "fromLng", "id", "lastName", "lastNotifiedAt", "luggage", "meetAndGreetName", "notes", "notificationStatus", "passengers", "paymentStatus", "phone", "pickupAt", "priceNotes", "quotedPrice", "reference", "returnTransfer", "routedAgencyId", "routedAt", "status", "toLabel", "toLat", "toLng", "type", "updatedAt", "vehicle" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");
CREATE INDEX "Booking_pickupAt_idx" ON "Booking"("pickupAt");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");
CREATE INDEX "Booking_cityId_idx" ON "Booking"("cityId");
CREATE INDEX "Booking_agencyId_idx" ON "Booking"("agencyId");
CREATE INDEX "Booking_routedAgencyId_idx" ON "Booking"("routedAgencyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Supplier_cityId_idx" ON "Supplier"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reference_key" ON "Reservation"("reference");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Reservation_createdAt_idx" ON "Reservation"("createdAt");

-- CreateIndex
CREATE INDEX "Reservation_supplierId_idx" ON "Reservation"("supplierId");

-- CreateIndex
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");

-- CreateIndex
CREATE INDEX "Transfer_reservationId_idx" ON "Transfer"("reservationId");

-- CreateIndex
CREATE INDEX "Transfer_transferDate_idx" ON "Transfer"("transferDate");

-- CreateIndex
CREATE INDEX "Passenger_reservationId_idx" ON "Passenger"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationStatusLog_reservationId_idx" ON "ReservationStatusLog"("reservationId");
