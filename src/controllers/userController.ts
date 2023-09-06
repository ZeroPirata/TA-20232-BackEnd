import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { UserDto } from "../dtos/users/userUpdateDto";
import UserService from "../services/userService";
import { User } from "../models";

class UserController {
    public async createUser(req: Request, res: Response) {
        try {
            const fields = ["name", "email", "password"];
            const errors: string[] = [];

            fields.forEach((field) => {
                if (!req.body[field]) {
                    errors.push(`Missing ${field} field`);
                }
            });

            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            const user: User = req.body;
            let createNewUser = await UserService.createUser(user);
            return res.status(201).json({ message: "User created successfully", data: createNewUser });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }



    public async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserService.getAllUser();
            console.log(users);
            const users = await UserService.getAllUser();
            if (!users) {
                res.status(404).json({ error: "Users not found" });
            } else {
                res.status(200).json(users);
            }
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    public async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const userId = parseInt(id, 10); 
    
        if (isNaN(userId)) {
            return res.status(400).json({ message: "O parâmetro 'id' não é um número válido" });
        } 
    
        try {
            const userExists = await UserRepository.findOneBy({
                email: req.body.email
            });
    
            if (!userExists)
                return res.status(400).json({ message: "Usuário não existe no sistema" });
    
            if (userExists && userId !== userExists.id)
                return res.status(400).json({ message: "Email já está sendo utilizado" });
    
            if (req.body.oldPassword && !await UserService.DecodePassword(req.body.oldPassword, userExists.password))
                return res.status(400).json({ message: "Senha anterior incorreta" });
    
            const userUpdate: UserDto = req.body;
            const user = UserRepository.create(userUpdate);
    
            if (req.body.password) {
                const encodedPassword: string = await UserService.EncodePassword(req.body.password);
                user.password = encodedPassword;
            }
            user.id = userId; 
    
            return res.status(200).json(await UserRepository.save(user));
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Erro ao atualizar usuário" });
        }
    }
    

}

export default new UserController();
