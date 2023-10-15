import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Subtask } from "../models";

export class SubtaskService {
    private subtaskRepository: Repository<Subtask>;

    constructor() {
        this.subtaskRepository = DataBaseSource.getRepository(Subtask);
    }

    public async createSubtask(subtask: Subtask) {
        try {
            const newSubtask = await this.subtaskRepository.save(subtask);
            return newSubtask;
        } catch (error) {
            return error;
        }
    }

    public async getSubtasksByTask(taskId: number): Promise<Subtask[] | Error> {
        try {
            const subtasks = await this.subtaskRepository.find({ where: { task: { id: taskId } } });
            return subtasks;
        } catch (error) {
            return error as Error;
        }
    }

    public async getSubtaskById(subtaskId: number) {
        try {
            const subtask = await this.subtaskRepository.findOneBy({ id : subtaskId });
            return subtask;
        } catch (error) {
            return error;
        }
    }

    public async getAllSubtasks(){
        try{
            const allSubtasks = await this.subtaskRepository
                                    .createQueryBuilder("subtask")
                                    .getMany();
            return allSubtasks;
        }catch (error) {
            return error;
        }
    }

    public async updateSubtask(id: number, subtask: Subtask) {
        try {
            const updatedSubtask = await this.subtaskRepository.update(id, subtask);
            if (!updatedSubtask.affected) {
                throw new Error("Subtask not found");
            }
            return updatedSubtask;
        } catch (error) {
            return error;
        }
    }

    public async deleteSubtask(id: number){
        try{
            const deletedSubtask = await this.subtaskRepository.delete(id);
            if(!deletedSubtask.affected){
                throw new Error("Subtask not found");
            }
            return deletedSubtask;
        }catch (error) {
            return error;
        }
    }
}

export default new SubtaskService();