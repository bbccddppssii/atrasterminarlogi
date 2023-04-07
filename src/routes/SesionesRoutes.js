"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SesionesController_1 = require("../controllers/SesionesController");
const checkObjectId_1 = require("../middleware/checkObjectId");
const checkPsicoAuth_1 = require("../middleware/checkPsicoAuth");
const router = (0, express_1.Router)();
//GET all session
//POST create a session
//PUT edit type session
//DELETE delete session 
router.route("/")
    .get(checkPsicoAuth_1.checkPsicoAuth)
    .post(checkPsicoAuth_1.checkPsicoAuth, SesionesController_1.createSession);
router.route("/:id")
    .delete(checkPsicoAuth_1.checkPsicoAuth, checkObjectId_1.checkObjectId, SesionesController_1.deleteSession);
exports.default = router;
