import { Repository } from "typeorm";
import bcrypt from 'bcrypt'
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
      public async EncodePassword(password: string): Promise<string>{
        const saltRounds = 10;
        let hashedPassword = '';
        await bcrypt.genSalt(saltRounds).then(async salt => {
            hashedPassword = await bcrypt.hash(password, salt)
        })

        return hashedPassword
    }

    public async DecodePassword(password: string, hashedPassword: string){
        return await bcrypt.compare(password, hashedPassword)
    }

}

export default new UserService();