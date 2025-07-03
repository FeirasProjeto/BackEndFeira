-- DropForeignKey
ALTER TABLE "Feira" DROP CONSTRAINT "Feira_userId_fkey";

-- DropForeignKey
ALTER TABLE "avaliacoes" DROP CONSTRAINT "avaliacoes_feiraId_fkey";

-- DropForeignKey
ALTER TABLE "avaliacoes" DROP CONSTRAINT "avaliacoes_userId_fkey";

-- DropForeignKey
ALTER TABLE "categoriaFeira" DROP CONSTRAINT "categoriaFeira_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "categoriaFeira" DROP CONSTRAINT "categoriaFeira_feiraId_fkey";

-- DropForeignKey
ALTER TABLE "diaSemanaFeira" DROP CONSTRAINT "diaSemanaFeira_diaSemanaId_fkey";

-- DropForeignKey
ALTER TABLE "diaSemanaFeira" DROP CONSTRAINT "diaSemanaFeira_feiraId_fkey";

-- DropForeignKey
ALTER TABLE "favoritos" DROP CONSTRAINT "favoritos_feiraId_fkey";

-- DropForeignKey
ALTER TABLE "favoritos" DROP CONSTRAINT "favoritos_userId_fkey";

-- DropForeignKey
ALTER TABLE "feiraTag" DROP CONSTRAINT "feiraTag_feiraId_fkey";

-- DropForeignKey
ALTER TABLE "feiraTag" DROP CONSTRAINT "feiraTag_tagId_fkey";

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feira" ADD CONSTRAINT "Feira_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaSemanaFeira" ADD CONSTRAINT "diaSemanaFeira_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaSemanaFeira" ADD CONSTRAINT "diaSemanaFeira_diaSemanaId_fkey" FOREIGN KEY ("diaSemanaId") REFERENCES "diaSemana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feiraTag" ADD CONSTRAINT "feiraTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feiraTag" ADD CONSTRAINT "feiraTag_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoriaFeira" ADD CONSTRAINT "categoriaFeira_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoriaFeira" ADD CONSTRAINT "categoriaFeira_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
