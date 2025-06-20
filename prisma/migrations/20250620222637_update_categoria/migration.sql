-- CreateTable
CREATE TABLE "categoriaFeira" (
    "categoriaId" INTEGER NOT NULL,
    "feiraId" TEXT NOT NULL,

    CONSTRAINT "categoriaFeira_pkey" PRIMARY KEY ("categoriaId","feiraId")
);

-- AddForeignKey
ALTER TABLE "categoriaFeira" ADD CONSTRAINT "categoriaFeira_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoriaFeira" ADD CONSTRAINT "categoriaFeira_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
