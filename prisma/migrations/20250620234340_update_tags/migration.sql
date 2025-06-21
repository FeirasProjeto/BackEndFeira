/*
  Warnings:

  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Tag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `feiraTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `categoria` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tagId` on the `feiraTag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "feiraTag" DROP CONSTRAINT "feiraTag_tagId_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_pkey",
ADD COLUMN     "categoria" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Tag_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "feiraTag" DROP CONSTRAINT "feiraTag_pkey",
DROP COLUMN "tagId",
ADD COLUMN     "tagId" INTEGER NOT NULL,
ADD CONSTRAINT "feiraTag_pkey" PRIMARY KEY ("tagId", "feiraId");

-- AddForeignKey
ALTER TABLE "feiraTag" ADD CONSTRAINT "feiraTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
