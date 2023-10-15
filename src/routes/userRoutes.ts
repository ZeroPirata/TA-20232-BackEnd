import {Router} from "express";
import UserController from "../controllers/userController";
import {auth} from "../middlewares/auth";

const userRouter = Router();

userRouter.post("/login", UserController.userLogin, 
    // #swagger.tags = ['Users']
);
userRouter.post("/create", UserController.createUser,
    // #swagger.tags = ['Users']
);
//userRouter.use(auth)
userRouter.get("/getAll", UserController.getAllUsers, 
    // #swagger.tags = ['Users']
);
userRouter.get("/getById/:id", UserController.getUserById, 
    // #swagger.tags = ['Users']
);
userRouter.put("/updateUser/:id", UserController.updateUser, 
    // #swagger.tags = ['Users']
);
userRouter.delete("/deleteUser", UserController.deleteUsers, 
    // #swagger.tags = ['Users']
);

export default userRouter;
