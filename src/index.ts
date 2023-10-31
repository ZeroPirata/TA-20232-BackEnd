import express from 'express';
import cors from 'cors';
import router from './routes';
import {DataBaseSource} from "./config/database";
import {MongoDataSource} from './config/mongoConfig';
import * as dotenv from "dotenv";
dotenv.config();

DataBaseSource.initialize()
    .then(() => {
        console.log("Banco inicializado com sucesso!")
    })
    .catch((err) => {
        console.error("Erro durante a inicialização do banco: ", err)
    })

console.log('Conectando ao MongoDB...');
MongoDataSource.initialize()
    .then(() => {
        console.log("MongoDB inicializado com sucesso!")
    })
    .catch((err) => {
        console.error("Erro durante a inicialização do MongoDB: ", err)
    })

const app = express();

let PORT = process.env.PORT_PRODUCTION || 5000

app.listen(PORT || 5000, ()=>{
    console.log("App is running on port 5000")
})

app.use(cors())
app.use(express.json())
app.use(router)

export default app;
