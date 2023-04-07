import dotenv from 'dotenv'
import express from 'express'
import connectDB from './config/db'
import morgan from "morgan"
import PsicologosRouter from './routes/PsicologoRoutes'
import { getPerfil, loginAuth } from './controllers/AuthController'
import EstudianteRouter from './routes/EstudianteRoutes'
import CitaRouter from './routes/CitaRoutes'
import SesionRouter from './routes/SesionesRoutes'
import cors from "cors";
//Server Configuration
dotenv.config()
connectDB();

const PORT = 4000 || process.env.PORT 
const app = express()
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//Display Requests
app.use(morgan("dev"))


app.use("/api/psicologos",PsicologosRouter)
app.use("/api/estudiantes",EstudianteRouter)
app.use("/api/citas", CitaRouter)
app.use("/api/sesion",SesionRouter)
app.use("/api/login",loginAuth);
app.use("/api/perfil",getPerfil);

app.get('*', function (req, res) {    
    const protocol = req.protocol;
    const host = req.hostname;
    const url = req.originalUrl;
    const port = process.env.PORT || 4000;
  
    const fullUrl = `${protocol}://${host}:${port}${url}`
      
    const responseString = `Full URL is: ${fullUrl}`;                       
    res.send(responseString);  
})


app.listen(PORT, () => {
  console.log('Server running at', PORT)
})
