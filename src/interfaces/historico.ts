import {ObjectId} from "typeorm";

export interface IHistorico {
  id?: ObjectId;
  taskId: number;
  data: string;
  user: {
    id: number;
    name: string;
  };
  campo: {
    [key: string]: {
      old: string;
      new: string;
    };
  };
}
