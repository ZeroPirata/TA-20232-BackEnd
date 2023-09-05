import { User } from "../models/User";
import { Request, Response } from "express";
import { UserDto } from "../dtos/users/userUpdateDto";
import { UserReadDto } from "../dtos/users/userReadDto";
import { UserRepository } from "../repositories/UserRepository";

class UserController {

    public async getAllUsers(req: Request, res: Response) {
        try {
            console.log('get all users')
        } catch (error) {
            console.log(error)
        }
    }

    public async updateUser(req: Request, res: Response) {

        const { id } = req.params
        const userService = new UserService()
        try {
            const userExists = await UserRepository.findOneBy({
                email: req.body.email
            })

            if (!userExists)
                return res.status(400).json({ message: "Usuário não existe no sistema" })

            if (userExists && id != userExists.id)
                return res.status(400).json({ message: "Email já está sendo utilizado" })



            if (req.body.oldPassword && !await userService.DecodePassword(req.body.oldPassword, userExists.password))
                return res.status(400).json({ message: "Senha anterior incorreta" })

            const userUpdate: UserDto = req.body
            const user = UserRepository.create(userUpdate)

            if (req.body.password) {
                const encodedPassword: string = await userService.EncodePassword(req.body.password)
                user.password = encodedPassword
            }
            user.id = id

            return res.status(200).json(await UserRepository.save(user))
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Erro ao atualizar usuário" })
        }
    }

}