"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PsicologoController_1 = require("../controllers/PsicologoController");
const checkAdminAuth_1 = require("../middleware/checkAdminAuth");
const checkPsicoAuth_1 = require("../middleware/checkPsicoAuth");
const router = (0, express_1.Router)();
router.get("/psicologosColaboradores", checkPsicoAuth_1.checkPsicoAuth, PsicologoController_1.getPsicologosColaboradores);
router.route("/")
    .get(checkAdminAuth_1.checkAdminAuth, PsicologoController_1.getAllPsicologos)
    .post(checkAdminAuth_1.checkAdminAuth, PsicologoController_1.createPsicologo);
router.route("/:id")
    .put(checkAdminAuth_1.checkAdminAuth, PsicologoController_1.updatePsicologo)
    .get(checkAdminAuth_1.checkAdminAuth, PsicologoController_1.getPsicologo)
    .delete(checkAdminAuth_1.checkAdminAuth, PsicologoController_1.deletePsicologo);
exports.default = router;
