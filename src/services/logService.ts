import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Task, Log, Subtask } from "../models";
import { StatusLevels } from "../models/StatusLevels";
import { PriorityLevels } from "../models/PriorityLevels";

class LogService {
    private logRepository: Repository<Log>;

    public debugConsole(from: string, logToDebug: string): void {
        console.log("\n-----------" + from + "-------------\n");
        console.log(logToDebug);
        console.log("\n------------------------\n");
    }

    constructor() {
        this.logRepository = DataBaseSource.getRepository(Log);
    }

    public async createLogFromTask(task: Task | any) {
        try {
            let newLog = this.taskToLog(task, true);
            let doesThisLogExistsAlready = await this.checkIfLogExists(newLog.daysAfterCreation, task.id);
            let result;
            newLog.done = true;
            if(doesThisLogExistsAlready.doesLogExist){
                this.debugConsole("createLogFromTask - if true", "DOESTHISLOGEXISTSALREADY DATA: " + JSON.stringify(doesThisLogExistsAlready));
                result = await this.updateLog(newLog, doesThisLogExistsAlready.logId);
            }else{
                this.debugConsole("createLogFromTask - if false", "DOESTHISLOGEXISTSALREADY DATA: " + JSON.stringify(doesThisLogExistsAlready));
                result = await this.saveLog(newLog);
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    public findDateSinceCreation(logCreatedAt: string | Date, parentTaskCreatedAt: string | Date): number {
        const parentDate = new Date(parentTaskCreatedAt);
        const logDate = new Date(logCreatedAt);
        
        
        // Calcula a diferença em milissegundos
        let diffMilliseconds = Math.abs(logDate.getTime() - parentDate.getTime());
        
        // Converte a diferença para dias
        let diffDays = Math.round(diffMilliseconds / (1000 * 3600 * 24));
        this.debugConsole("findDateSinceCreation", "DIFF DAYS: " + diffDays);
        
        return diffDays;
    }
    
    /**
     * Obtém todos os registros de log associados a uma tarefa específica pelo ID da tarefa.
     *
     * @param {number} taskId O ID da tarefa para a qual os registros de log estão sendo obtidos.
     * @returns {Promise<Log[]>} Uma promessa que resolve em uma matriz de objetos de log associados à tarefa.
     */
    public async getAllByTaskId(taskId : number){
        try {
            let result = this.logRepository
                .createQueryBuilder("log")
                .where("log.parent_task_id = :taskId", { taskId })
                .getMany();

            return result;
        } catch (error) {
            this.debugConsole("taskToLog", "ERROR:\n - " + error);
        }
    }

    /** 
    * 
    * Função de conversão;
    * Cria um objeto LOG a partir de uma task
    * @param {Task} task a ser convertida
    * @param {Boolean} cleanLog Verdadeiro caso queira que a log nova tenha todos os valores que não sejam o nome e a descrição como vazios/limpos;
    * Os campos "nome", "subtask", "description" e os campos de data ainda serão os mesmos da task original, mas todos os outros campos terão seus valores DEFAULT.
    * (Caso marque como "False", a log nova será exatamente igual a task original)
    * 
    * Note: Log nova não será enviada ao banco com essa função
    **/
    public taskToLog(task: Task, cleanLog: boolean): Log {
        try {
            let newLog = new Log();
            newLog.name = task.name;
            newLog.description = task.description;
            newLog.subtask = this.subtaskToJson(task.subtask);
            newLog.deadline = task.deadline;
            if (cleanLog === true) {
                newLog.status = StatusLevels.TODO;
                newLog.done = false;
                newLog.timeSpent = 0;
                newLog.parentTask = task;
            } else {
                newLog.status = task.status;
                newLog.done = task.done;
                newLog.timeSpent = task.timeSpent;
                newLog.parentTask = task;
            }
            newLog.created_at = new Date();
            let daysSinceCreation = this.findDateSinceCreation(newLog.created_at, task.createdAt);
            //Importante para identificação de LOGS, para verificar se um log já existe em X dia
            newLog.daysAfterCreation = daysSinceCreation;
            return newLog;

        } catch (error) {
            this.debugConsole("taskToLog", "ERROR:\n - " + error);
            return new Log();
        }
    }


        /**
     * Função de conversão;
     * Cria um objeto TASK a partir de um LOG
     *
     * @param {Log} log - O objeto LOG a ser convertido em uma TASK.
     * @returns {Task} - O objeto TASK correspondente ao LOG.
     *
     * Note: Esta função não salva a nova TASK no banco de dados.
     */
    public logToTask(log: Log, userId: number): Task {
        const newTask = new Task();

        // Copie os atributos do log para a nova tarefa
        newTask.name = log.name;
        newTask.description = log.description;
        newTask.priority = PriorityLevels.LOW;
        newTask.status = log.status;
        newTask.done = log.done;
        newTask.timeSpent = log.timeSpent;
        newTask.deadline = log.deadline;

        // Crie um array de subtasks a partir da string JSON
        if (log.subtask) {
            newTask.subtask = this.JsonToSubtasks(log.subtask);
        } else {
            newTask.subtask = [];
        }

        newTask.userId = userId;


        return newTask;
    }

    public async saveLog(logToSave : Log){
        try {
            this.debugConsole("saveLog", "DATA: " + JSON.stringify(logToSave));
            const result = await this.logRepository.save(logToSave);
            return result;
        } catch (error : any) {
            throw new Error(error);
        }
    }

    public async checkIfLogExists(daysSinceCreation : number, taskId : number) : Promise<{doesLogExist : Boolean, logId : Number}>{
        try{
            const logs = await this.getAllByTaskId(taskId);
            let exists = false;
            let logId  = 0;
            if(logs){
                // Encontre o primeiro objeto na matriz com daysAfterCreation igual a daysSinceCreation
                const foundLog = logs.find((log) => log.daysAfterCreation === daysSinceCreation);
                if (foundLog) {
                    exists = true;
                    logId = foundLog.id;
                }
            }
            return {doesLogExist: exists, logId};
        }catch(error : any){
            this.debugConsole("checkIfLogExists", "ERRO: " + error);
            throw new Error(error);
        }

    }

    public async updateLog(updatedLog : Log, originalLogId : Number){
        try {
            const updatedLogObject = this.logRepository.create(updatedLog);
            const queryLogUpdate = await this.logRepository
                    .createQueryBuilder()
                    .update(Log)
                    .set(updatedLogObject)
                    .where("id = :id AND daysAfterCreation = :daysAfterCreation", 
                        {
                            id: originalLogId,
                            daysAfterCreation: updatedLogObject.daysAfterCreation
                        }
                    );
            return queryLogUpdate;

        } catch (error : any) {
            this.debugConsole("updateLog", "ERRO: \n" + JSON.stringify(error));
            throw new Error(error);
        }
    }

    public subtaskToJson(subtasks: Subtask[]): string {
        try {
            const jsonSubtasks = JSON.stringify(subtasks);
            return jsonSubtasks;
        } catch (error : any) {
            this.debugConsole("subtaskToJson", "ERROR:\n - " + error);
            throw new Error(error);
        }
    }

    public JsonToSubtasks(jsonString: string): Subtask[] {
        try {
            const subtasks = JSON.parse(jsonString);
            if (Array.isArray(subtasks)) {
                return subtasks;
            } else {
                throw new Error("JSON não representa uma array de subtasks.");
            }
        } catch (error : any) {
            this.debugConsole("JsonToSubtasks", "ERROR:\n - " + error);
            throw new Error(error);
        }
    }

}

export default new LogService();