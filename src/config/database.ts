import "reflect-metadata";
import { DataSource } from "typeorm";
import{
    Task,
    Subtask,
    User
} from "../models";

import * as dotenv from "dotenv";

dotenv.config();

export const DataBaseSource = new DataSource({

    type: "mysql",
    host: process.env.HOST,
    port: Number(process.env.PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    synchronize: false,
    logging: false, 
    entities: [Task, Subtask, User]

});

export { DataSource };
