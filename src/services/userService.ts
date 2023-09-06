import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { User } from "../models";

class UserService{
    private userRepository: Repository<User>;
    constructor() {
        this.userRepository = DataBaseSource.getRepository(User);
    }

    public async createUser(user: User) {
        try {
            const newUser = await this.userRepository.save(user);
            return newUser;
        } catch (error) {
            return error
        }
    }

    public async verifyEmail(user: User): Promise<User | undefined>{
      try {
        const verifyUser = await this.userRepository.findOne({ where: { email: user?.email } });
        return verifyUser || undefined;
      } catch (error) {
        throw error;
      }
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