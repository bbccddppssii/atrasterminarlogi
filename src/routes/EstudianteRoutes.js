"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EstudianteController_1 = require("../controllers/EstudianteController");
const checkPsicoAuth_1 = require("../middleware/checkPsicoAuth");
const router = (0, express_1.Router)();
router.route("/")
    .get(checkPsicoAuth_1.checkPsicoAuth, EstudianteController_1.getAllEstudiante)
    .post(checkPsicoAuth_1.checkPsicoAuth, EstudianteController_1.createEstudiante);
router.route("/:id")
    .put(checkPsicoAuth_1.checkPsicoAuth, EstudianteController_1.updateEstudiante)
    .get(checkPsicoAuth_1.checkPsicoAuth, EstudianteController_1.getEstudiante)
    .delete(checkPsicoAuth_1.checkPsicoAuth, EstudianteController_1.deleteEstudiante);
router.route("/codigo/:codigo")
    .get(checkPsicoAuth_1.checkPsicoAuth, EstudianteController_1.getEstudianteCodigo);
exports.default = router;
