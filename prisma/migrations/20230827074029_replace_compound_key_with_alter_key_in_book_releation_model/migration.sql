/*
  Warnings:

  - The primary key for the `BookLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SelectedBook` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "BookLike" DROP CONSTRAINT "BookLike_pkey",
ADD COLUMN     "booklikeSeq" SERIAL NOT NULL,
ADD CONSTRAINT "BookLike_pkey" PRIMARY KEY ("booklikeSeq");

-- AlterTable
ALTER TABLE "SelectedBook" DROP CONSTRAINT "SelectedBook_pkey",
ADD COLUMN     "selectedBookSeq" SERIAL NOT NULL,
ADD CONSTRAINT "SelectedBook_pkey" PRIMARY KEY ("selectedBookSeq");
