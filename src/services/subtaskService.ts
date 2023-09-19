import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Subtask } from "../models";

class SubtaskService {
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

}

export default new SubtaskService();