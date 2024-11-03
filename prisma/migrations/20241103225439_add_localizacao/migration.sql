-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "feirante" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" VARCHAR(36) NOT NULL,
    "userId" TEXT NOT NULL,
    "feiraId" TEXT NOT NULL,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" VARCHAR(36) NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feira" (
    "id" VARCHAR(36) NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "data" TIMESTAMP(3),
    "descricao" TEXT,
    "imagem" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Feira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diaSemana" (
    "id" VARCHAR(36) NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "diaSemana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diaSemanaFeira" (
    "diaSemanaId" TEXT NOT NULL,
    "feiraId" TEXT NOT NULL,

    CONSTRAINT "diaSemanaFeira_pkey" PRIMARY KEY ("diaSemanaId","feiraId")
);

-- CreateTable
CREATE TABLE "feiraTag" (
    "tagId" TEXT NOT NULL,
    "feiraId" TEXT NOT NULL,

    CONSTRAINT "feiraTag_pkey" PRIMARY KEY ("tagId","feiraId")
);

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feira" ADD CONSTRAINT "Feira_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaSemanaFeira" ADD CONSTRAINT "diaSemanaFeira_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaSemanaFeira" ADD CONSTRAINT "diaSemanaFeira_diaSemanaId_fkey" FOREIGN KEY ("diaSemanaId") REFERENCES "diaSemana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feiraTag" ADD CONSTRAINT "feiraTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feiraTag" ADD CONSTRAINT "feiraTag_feiraId_fkey" FOREIGN KEY ("feiraId") REFERENCES "Feira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
