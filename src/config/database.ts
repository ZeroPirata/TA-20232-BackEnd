import "reflect-metadata";
import {DataSource} from "typeorm";
import {Task, Subtask, User} from "../models";
import * as dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const entidades = [Task, Subtask, User];

export const DataBaseSource = process.env.PATH_PEM
  ? new DataSource({
      type: "mysql",
      host: process.env.HOST,
      port: Number(process.env.PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DATABASE,
      synchronize: true,
      logging: false,
      ssl: {
        ca: fs.readFileSync(process.env.PATH_PEM, {encoding: "utf-8"}),
      },
      entities: entidades,
    })
  : new DataSource({
      type: "mysql",
      host: process.env.HOST,
      port: Number(process.env.PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DATABASE,
      synchronize: true,
      logging: false,
      entities: entidades,
    });

export {DataSource};
