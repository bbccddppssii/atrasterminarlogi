"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CitaController_1 = require("../controllers/CitaController");
const checkObjectId_1 = require("../middleware/checkObjectId");
const checkPsicoAuth_1 = require("../middleware/checkPsicoAuth");
const router = (0, express_1.Router)();
router.post("/posponer", checkPsicoAuth_1.checkPsicoAuth, CitaController_1.postPoneCitas);
router.post("/eliminar-citas", checkPsicoAuth_1.checkPsicoAuth, CitaController_1.deleteMultipleCitas);
router.route("/")
    .get(checkPsicoAuth_1.checkPsicoAuth, CitaController_1.getAllMyCitas)
    .post(checkPsicoAuth_1.checkPsicoAuth, CitaController_1.createCita);
router.route("/:id")
    .get(checkPsicoAuth_1.checkPsicoAuth, checkObjectId_1.checkObjectId, CitaController_1.getCita)
    .put(checkPsicoAuth_1.checkPsicoAuth, checkObjectId_1.checkObjectId, CitaController_1.updateCita)
    .delete(checkPsicoAuth_1.checkPsicoAuth, checkObjectId_1.checkObjectId, CitaController_1.deleteCita);
exports.default = router;
