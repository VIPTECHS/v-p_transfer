-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "routedAgencyId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "routedAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "agencyResponseStatus" TEXT;
ALTER TABLE "Booking" ADD COLUMN "agencyRespondedAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "agencyDeclineNote" TEXT;

-- CreateIndex
CREATE INDEX "Booking_routedAgencyId_idx" ON "Booking"("routedAgencyId");
