import { Router } from "express";
import atualizaProximaOcorrencia from "../crons/atualizaProximaOcorrencia";
import deletaAntigas from "../crons/deletaAntigas";

const router = Router();

router.get("/atualizaProximaOcorrencia", atualizaProximaOcorrencia);
router.get("/deletaAntigas", deletaAntigas);

export default router;
