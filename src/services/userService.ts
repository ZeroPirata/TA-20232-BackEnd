import { Repository } from "typeorm";
import bcrypt from 'bcrypt'
import { DataBaseSource } from "../config/database";
import { User } from "../models";
import { UserDto } from "../dtos/users/userUpdateDto";
import { UserRepository } from "../repositories/UserRepository";

class UserService{
    private userRepository: Repository<User>;
    GetUserData: any;
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

      public async getUserById(id: number): Promise<UserDto>{
        try{
            const user = await this.userRepository.findOneBy({ id : id } );
            if(!user){
              throw new Error("User not found");
            }else{
              return user;
            }
        }catch(error: any){
          return error;
        }
      }

      public async updateUser(userId: number, userData: UserDto) {
        try {
          const userExists = await UserRepository.findOneBy({ id: userId });
    
          if (!userExists) {
            throw new Error("Usuário não existe no sistema");
          }

          if (userExists.email !== userData.email) {
            throw new Error("Email já está sendo utilizado");
          }
    
          const updatedUser: UserDto = { ...userExists, ...userData };
    
          if (userData.password) {
            updatedUser.password = await this.EncodePassword(userData.password);
          }
    
          const savedUser = await UserRepository.update(userId, updatedUser);
    
          return savedUser;
        } catch (error) {
          console.error(error);
          throw new Error("Erro ao atualizar usuário");
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