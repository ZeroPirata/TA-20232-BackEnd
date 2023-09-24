import { Request, Response } from "express";
import SubtaskService from "../services/subtaskService";
import { Subtask } from "../models";
import { SubtaskUpdateDto } from "../dtos/subtask/subtaskUpdateDto";
import { subtaskRepository } from "../repositories/SubtaskRepository";
import subtaskService from "../services/subtaskService";

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

    public async getSubtaskById(req: Request, res: Response) {
        try {
            const subtaskId: number = parseInt(req.params.subtaskId);
            const subtask = await SubtaskService.getSubtaskById(subtaskId);
            res.status(200).json({ data: subtask });
        } catch (error) {
            res.status(400).json({ error: "Error fetching subtasks" })
        }
    }

    public async getAllSubtasks(req: Request, res: Response) {
        try {
            const allSubtasks = await subtaskService.getAllSubtasks();
            res.status(200).json({ message: "All subtasks", data: allSubtasks });
        } catch (error) {
            res.status(400).json({ error: "Tasks not found" });
        }
    }

    public async deleteSubtask(req: Request, res: Response) {

        const { id } = req.params;
        const taskId = parseInt(id, 10);

        if (isNaN(taskId)) {
            return res.status(400).json({ message: "Parameter id is not a valid number" })
        }

        try {
            const subtaskId: number = parseInt(req.params.id, 10);
            const subtask = await subtaskService.deleteSubtask(subtaskId);
            res.status(200).json({ message: "Subtask deleted successfully", data: subtask });

        } catch (error: any) {
            if (error.message === "Subtask not found") {
                res.status(404).json({ error: "Subtask not found" });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }

    }

    public async updateSubtask(req: Request, res: Response) {

        const { id } = req.params;
        const taskId = parseInt(id, 10);

        if (isNaN(taskId)) {
            return res.status(400).json({ message: "Parameter id is not a valid number" })
        }

        try {
            let subtaskUpdate: SubtaskUpdateDto = req.body;
            let subtask = subtaskRepository.create(subtaskUpdate);
            subtask.id = parseInt(id, 10);

            await subtaskRepository.save(subtask);
            return res.status(200).json({ message: "Subtask updated successfully", data: subtask });
        } catch (error: any) {
            if (error.message === "Subtask not found") {
                res.status(404).json({ error: "Subtask not found" });
            } else {
                res.status(500).json({ error: "Internal server error" })
            }
        }

    }
}

export default new SubtaskController();