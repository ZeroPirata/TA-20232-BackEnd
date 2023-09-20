import { Request, Response } from "express";
import SubtaskService from "../services/subtaskService";
import { Subtask } from "../models";

class SubtaskController {
    public async createSubtask(req: Request, res: Response) {
        try {
            const subtaskData: Subtask = req.body;
            const createdSubtask = await SubtaskService.createSubtask(subtaskData);
            res.status(200).json({ message: "Subtask created successfully", data: createdSubtask });
        } catch (error) {
            res.status(400).json({ error: "Error creating subtask" });
        }
    }

    public async getSubtasksByTask(req: Request, res: Response) {
        try {
            const taskId: number = parseInt(req.params.taskId);
            const subtasks = await SubtaskService.getSubtasksByTask(taskId);
            res.status(200).json({ data: subtasks });
        } catch (error) {
            res.status(400).json({ error: "Error fetching subtasks" });
        }
    }


}

export default new SubtaskController();