export interface IHistorico {
  id: number;
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
