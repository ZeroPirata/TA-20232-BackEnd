import { DataBaseSource } from "../config/database";
import { Subtask } from "../models";

export const subtaskRepository = DataBaseSource.getRepository(Subtask);