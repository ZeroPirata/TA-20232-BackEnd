import {Request, Response} from "express";
import * as http from "http";

class StatusController {
  public async getStatus(req: Request, res: Response) {
    try {
      // Verifique a conexão do Express
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
  /**
   * Função responsável por atualização de tempo no banco;
   * Utilizado para criação do LOG de tarefas ciclicas;
   */
  public async timeUpdate(req: Request, res: Response){
    try {
      
    } catch (error) {
      res.status(500).json({message: "Erro na atualização diária", error: error});
    }
  }
}

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
