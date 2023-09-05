import { User } from "../models/User";
import { DataBaseSource } from "../config/database";

export const UserRepository = DataBaseSource.getRepository(User)