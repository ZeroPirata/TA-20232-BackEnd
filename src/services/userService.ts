import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { User } from "../models";

class UserService{
    private userRepository: Repository<User>;
    constructor() {
        this.userRepository = DataBaseSource.getRepository(User);
    }
    public async getAllUser() {
        try {
          const getAllUser = await this.userRepository
            .createQueryBuilder("user")
            .getMany();
         return getAllUser;
        } catch (error) {
          return error
        }
      }

}

export default new UserService();