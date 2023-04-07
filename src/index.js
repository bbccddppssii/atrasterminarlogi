"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const morgan_1 = __importDefault(require("morgan"));
const PsicologoRoutes_1 = __importDefault(require("./routes/PsicologoRoutes"));
const AuthController_1 = require("./controllers/AuthController");
const EstudianteRoutes_1 = __importDefault(require("./routes/EstudianteRoutes"));
const CitaRoutes_1 = __importDefault(require("./routes/CitaRoutes"));
const SesionesRoutes_1 = __importDefault(require("./routes/SesionesRoutes"));
const cors_1 = __importDefault(require("cors"));
//Server Configuration
dotenv_1.default.config();
(0, db_1.default)();
const PORT = 4000 || process.env.PORT;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
//Display Requests
app.use((0, morgan_1.default)("dev"));
app.use("/api/psicologos", PsicologoRoutes_1.default);
app.use("/api/estudiantes", EstudianteRoutes_1.default);
app.use("/api/citas", CitaRoutes_1.default);
app.use("/api/sesion", SesionesRoutes_1.default);
app.use("/api/login", AuthController_1.loginAuth);
app.use("/api/perfil", AuthController_1.getPerfil);
app.listen(PORT, () => {
    console.log('Server running at', PORT);
});
