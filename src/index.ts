import {DataBaseSource} from "./config/database";

DataBaseSource.initialize()
    .then(() => {
        console.log("Banco inicializado com sucesso!")
    })
    .catch((err) => {
        console.error("Erro durante a inicialização do banco: ", err)
    })