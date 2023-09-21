import { Request, Response } from "express";

class StatusController {

  public async getStatus(req: Request, res: Response) {
    try {
      // Verifique a conexão do Express
      const isExpressListening = checkExpressListening();

      if (isExpressListening) {
        res.status(200).json({ status: 'OK' });
      } else {
        throw new Error('A conexão do Express está com problemas');
      }
    } catch (error) {
      res.status(500).json("Fronted não deve ser renderizado");
    }
  }
}

export default new StatusController();

function checkExpressListening() {
    const expressPort = 5000;
  
    try {
      const expressServer = require('http').createServer();
      expressServer.listen(expressPort);
  
      return true;
    } catch (error) {

      return false;
    }
  }