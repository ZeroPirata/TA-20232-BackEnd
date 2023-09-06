import { Router } from "express";
import UserController from "../controllers/userController";

const userRouter = Router();


userRouter.post("/create", UserController.createUser);
userRouter.get("/getAll", UserController.getAllUsers);
userRouter.put("/updateUser", UserController.updateUser);

export default userRouter;