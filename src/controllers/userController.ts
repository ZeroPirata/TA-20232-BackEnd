import { Request, Response } from "express";
import userService from "../services/userService";
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
            let createNewUser = await userService.createUser(user);
            return res.status(201).json({ message: "User created successfully", data: createNewUser });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }



    public async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllUser();
            if (!users) {
                res.status(404).json({ error: "Users not found" });
            } else {
                res.status(200).json(users);
            }
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export default new UserController();
