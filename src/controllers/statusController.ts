import {Request, Response} from "express";
import * as http from "http";

class StatusController {
  public async getStatus(req: Request, res: Response) {
    try {

      const isExpressListening = checkExpressListening();

      if (isExpressListening) {
        res.status(200).json({status: "OK"});
      } else {
        throw new Error("A conexão do Express está com problemas");
      }
    } catch (error) {
      res.status(500).json("Frontend não deve ser renderizado");
    }
  }
}
  /**
   * Função responsável por atualização de tempo no banco;
   * Utilizado para criação do LOG de tarefas ciclicas;
   */
  // public async timeUpdate(req: Request, res: Response){
  //   try {
  //     const { id } = req.params;
  //     const userId = parseInt(id, 10); 
  //     const checkExpiredLogs = logService.verifyExpiredLogs(userId);
  //     console.log("Rodando a task");

  //     res.status(200).json({message:"successful time update", response:JSON.stringify(checkExpiredLogs)});
  //   } catch (error) {
  //     res.status(500).json({message: "unsuccessful time update", error: error});
  //   }
  // }

export default new StatusController();

function checkExpressListening() {
  const expressPort = 5000;

  const options = {
    hostname: "localhost",
    port: expressPort,
  };

  const req = http.request(options, (res: http.IncomingMessage) => {
    if (res.statusCode === 200) {
      return true;
    } else {
      return false;
    }
  });

  req.on("error", (error) => {
    console.error(`Erro ao verificar o servidor Express: ${error.message}`);
  });

  req.end();

  return req;
}
