-- CreateTable
CREATE TABLE "SelectedBook" (
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,

    CONSTRAINT "SelectedBook_pkey" PRIMARY KEY ("userId","bookId")
);

-- AddForeignKey
ALTER TABLE "SelectedBook" ADD CONSTRAINT "SelectedBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedBook" ADD CONSTRAINT "SelectedBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
