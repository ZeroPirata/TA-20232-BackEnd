import { Router } from "express";
import userRouter from "./userRoutes";
import taskRouter from "./taskRoutes";

const router = Router();


router.use("/user", userRouter);
router.use("/task", taskRouter);

export default router;