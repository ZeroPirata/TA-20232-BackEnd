import { Request, Response } from "express";
import UserService from "../services/userService";
import userService from "../services/userService";

class UserController {

    public async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllUser();
            console.log(users);
            if (!users) {
                res.status(404).json({ error: "Users not found" });
            }else{
                res.status(200).json(users);
            }
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export default new UserController();
