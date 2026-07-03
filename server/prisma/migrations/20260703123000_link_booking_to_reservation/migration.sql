PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "bookingId" TEXT,
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
    CONSTRAINT "Reservation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_assignedVehicleId_fkey" FOREIGN KEY ("assignedVehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Reservation" (
    "id",
    "reference",
    "status",
    "supplierId",
    "supplierPrice",
    "supplierCurrency",
    "supplierPaymentStatus",
    "supplierPaymentType",
    "supplierPaymentDate",
    "supplierNote",
    "customerId",
    "salePrice",
    "saleCurrency",
    "customerPaymentStatus",
    "customerPaymentType",
    "customerPaymentDate",
    "customerNote",
    "assignedVehicleId",
    "assignedDriverId",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "reference",
    "status",
    "supplierId",
    "supplierPrice",
    "supplierCurrency",
    "supplierPaymentStatus",
    "supplierPaymentType",
    "supplierPaymentDate",
    "supplierNote",
    "customerId",
    "salePrice",
    "saleCurrency",
    "customerPaymentStatus",
    "customerPaymentType",
    "customerPaymentDate",
    "customerNote",
    "assignedVehicleId",
    "assignedDriverId",
    "createdAt",
    "updatedAt"
FROM "Reservation";

DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";

CREATE UNIQUE INDEX "Reservation_reference_key" ON "Reservation"("reference");
CREATE UNIQUE INDEX "Reservation_bookingId_key" ON "Reservation"("bookingId");
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");
CREATE INDEX "Reservation_createdAt_idx" ON "Reservation"("createdAt");
CREATE INDEX "Reservation_supplierId_idx" ON "Reservation"("supplierId");
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");
CREATE INDEX "Reservation_bookingId_idx" ON "Reservation"("bookingId");

PRAGMA foreign_keys=ON;
