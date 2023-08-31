/*
  Warnings:

  - A unique constraint covering the columns `[userId,bookId]` on the table `BookLike` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,bookId]` on the table `SelectedBook` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookLike_userId_bookId_key" ON "BookLike"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedBook_userId_bookId_key" ON "SelectedBook"("userId", "bookId");
