import { Router } from "express";
import UserController from "../controllers/userController";

const userRouter = Router();


userRouter.get("/getAll", UserController.getAllUsers);

export default userRouter;