import { Router } from "express";
import userRouter from "./userRoutes";
import taskRouter from "./taskRoutes";
import subtaskRouter from "./subtaskRoutes";
import statusRouter from "./statusRoutes";

const router = Router();


router.use("/user", userRouter);
router.use("/task", taskRouter);
router.use("/subtask", subtaskRouter);
router.use("/status", statusRouter);

export default router;