import { Router } from "express";
import { loginAuth } from "../controllers/AuthController";

const router = Router();

//LOGIN

router.post("/", loginAuth); 

export default router