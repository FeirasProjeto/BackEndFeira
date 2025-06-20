-- AlterTable
ALTER TABLE "Feira" ADD COLUMN     "categoriaId" INTEGER;

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feira" ADD CONSTRAINT "Feira_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
