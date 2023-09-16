import { Router } from "express";
import UserController from "../controllers/userController";
import { auth } from "../middlewares/auth";

const userRouter = Router();


userRouter.post("/login", UserController.userLogin)
userRouter.post("/create", UserController.createUser);
//userRouter.use(auth)
userRouter.get("/getAll", UserController.getAllUsers);
userRouter.put("/updateUser", UserController.updateUser);
userRouter.delete("/deleteUser", UserController.deleteUsers);

export default userRouter;