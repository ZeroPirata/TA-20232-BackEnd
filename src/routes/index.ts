import { Router } from "express";
import userRouter from "./userRoutes";
import taskRouter from "./taskRoutes";
import subtaskRouter from "./subtaskRoutes";

const router = Router();


router.use("/user", userRouter);
router.use("/task", taskRouter);
router.use("/subtask", subtaskRouter);

export default router;