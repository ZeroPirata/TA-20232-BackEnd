import { Task } from '../models/Task';
import { DataBaseSource } from '../config/database';

export const taskRepository = DataBaseSource.getRepository(Task);