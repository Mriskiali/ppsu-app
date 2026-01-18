/*
  Warnings:

  - You are about to drop the column `lat` on the `Laporan` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Laporan` table. All the data in the column will be lost.
  - Added the required column `location` to the `Laporan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Laporan" DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "location" TEXT NOT NULL;
