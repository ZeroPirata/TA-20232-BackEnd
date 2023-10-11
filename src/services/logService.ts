import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Task, Log, Subtask } from "../models";
import { StatusLevels } from "../models/StatusLevels";
import { PriorityLevels } from "../models/PriorityLevels";
import taskService from "../services/taskService";

class LogService {
    private logRepository: Repository<Log>;


    constructor() {
        this.logRepository = DataBaseSource.getRepository(Log);
    }

    /**
     * Verifica se há registros de log expirados para um usuário.
     * @param userId O ID do usuário para o qual os registros de log serão verificados.
     * @returns Retorna o resultado da verificação.
     */
    public async verifyExpiredLogs(userId: number) {
        try {
            let result;
            const allTasks = await taskService.getTasksByUserId(userId);

            if (Array.isArray(allTasks) && allTasks.length > 0) {

                const cyclicTasks = allTasks.filter((task) => task.customInterval !== 0);
                cyclicTasks.forEach(async thisTask => {
                    let daysSinceTaskCreation = this.findDateSinceCreation(new Date(), thisTask.createdAt);
                    for (let logIndex = daysSinceTaskCreation; logIndex > 0; logIndex--) {
                        let log: Log = this.taskToLog(thisTask, true, logIndex);
                        
                        const isExpired = await this.isThisLogExpired(log);

                        let newLog : Log = await this.findLogByGetterId(log.getterIdCode);

                        if(newLog.name != null){
                            log = newLog;
                        }

                        if (isExpired === true) {
                            const isLogDone = log.done === true;
                            await this.createLogFromTask(isLogDone, log, thisTask);
                        }
                        
                    }

                });
            }
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    }
    /**
     * Cria um registro de log com base em uma tarefa concluída ou não.
     * @param taskDone Indica se a tarefa foi concluída.
     * @param beforeLog O registro de log existente antes da criação.
     * @param thisTask A tarefa associada ao log (opcional).
     * @returns Retorna o resultado da operação (atualização ou criação do log).
     */
    public async createLogFromTask(taskDone: boolean, beforeLog: Log, thisTask? : Task) {
        try {
            let newLog: Log;
            newLog = beforeLog;
            let task : Task = newLog.parentTask;
            if(thisTask) {
                task = thisTask;
            }


            let doesThisLogExistsAlready = await this.checkIfLogExists(newLog.getterIdCode, task.id);

            let result;
            newLog.done = taskDone;
            if (doesThisLogExistsAlready.doesLogExist) {

                result = await this.updateLog(newLog, doesThisLogExistsAlready.logId);
            } else {

                result = await this.saveLog(newLog);
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    /**
     * Verifica se um log já expirou, pegando a diferença de dias entre 
     * a data de criação da task original e a data de criação do log, então verifica se esse valor é maior que o intervalo customizado
     * 
     * @param {Log} log Log a ser testado
     * @returns {Promise<Boolean>} Retorna verdadeiro caso o log já tenha passado do customIntervalo
     */
    public async isThisLogExpired(log: Log): Promise<boolean> {

        try {
            let daysSinceCreation = this.findDateSinceCreation(log.created_at, log.parentTask.createdAt);
            const _customInterval = log.parentTask.customInterval;
            if (daysSinceCreation % _customInterval === 0 && log.done === false) {
                return true
            }
            return false
        } catch (error: any) {
            throw new Error(error);
        }

    }
    /**
     * Função para encontrar o número de dias entre a criação de um log e a criação de sua tarefa pai.
     * @param {string | Date} logCreatedAt - Data de criação do log (pode ser uma string ou um objeto Date).
     * @param {string | Date} parentTaskCreatedAt - Data de criação da tarefa pai (pode ser uma string ou um objeto Date).
     * @returns {number} - Número de dias entre as duas datas.
     */
    public findDateSinceCreation(logCreatedAt: string | Date, parentTaskCreatedAt: string | Date): number {
        const parentDate = new Date(parentTaskCreatedAt);
        const logDate = new Date(logCreatedAt);


        // Calcula a diferença em milissegundos
        let diffMilliseconds = Math.abs(logDate.getTime() - parentDate.getTime());

        // Converte a diferença para dias
        let diffDays = Math.round(diffMilliseconds / (1000 * 3600 * 24));

        return diffDays;
    }

    /**
     * Obtém todos os registros de log associados a uma tarefa específica pelo ID da tarefa.
     *
     * @param {number} taskId O ID da tarefa para a qual os registros de log estão sendo obtidos.
     * @returns {Promise<Log[]>} Uma promessa que resolve em uma matriz de objetos de log associados à tarefa.
     */
    public async getAllLogsByTaskId(taskId: any) {
        try {

            let result = await this.logRepository.find({ where: { parentTask: taskId }, loadRelationIds: true })

            return result;
        } catch (error: any) {
            throw new Error(error)
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
    public taskToLog(task: Task, cleanLog: boolean, debugLogDate?: number): Log {
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
            } else {
                newLog.status = task.status;
                newLog.done = task.done;
                newLog.timeSpent = task.timeSpent;
            }
            newLog.parentTask = task;
            newLog.parentTask.id = task.id;
            newLog.created_at = new Date();

            if (debugLogDate != null) {
                newLog.created_at.setDate(task.createdAt.getDate() + debugLogDate);
            }
            let daysSinceCreation = this.findDateSinceCreation(newLog.created_at, task.createdAt);
            //Importante para identificação de LOGS, para verificar se um log já existe em X dia
            newLog.daysAfterCreation = daysSinceCreation;

            newLog.getterIdCode = this.createNewLogId(newLog);
            return newLog;

        } catch (error: any) {
            throw new Error(error);
        }
    }
    /**
     * Gera um ID especial para os logs. Gets e coisas do gênero precisam usar esse id para encontrar os respectivos logs (especialmente quando estiver procurando-o como uma task)
     * O nome do campo especial é "getterIdCode". É uma string
     * 
     * O id especial SEMPRE será "(id_da_task_original)_TASK_(daysAfterCreation do log)". Exemplo disso: "45_TASK_6". Dessa forma.
     * @note Caso, em alguma ocasião, seja necessário alterar o id da tarefa original ligada ao log, é OBRIGATORIO que o ID seja alterado também
     * 
     * @param log O log recebido PRECISA estar com os campos "DaysAfterCreation" e "parentTask" registrados antes da função ser chamada
     * @returns Uma Promise<String> com o novo id, criado a partir do log. 
     */
    public createNewLogId(log: Log): string {

        const parentTaskId = log.parentTask.id;
        const logDAC = log.daysAfterCreation;

        let result = parentTaskId + "_TASK_" + logDAC;

        return result;
    }

    /**
     * Retorna um LOG baseado no getterId. Enfasê que ele terá como retorno também um objeto LOG, então caso esteja selecionando tasks seria necessário conversão, seja manual ou utilizando a função taskToLog
     * @param getterId 
     * @returns {Promise<Log>} 
     */
    public async findLogByGetterId(getterId: string): Promise<Log> {
        try {

            const log = await this.logRepository.findOne({ where: { getterIdCode: getterId }, loadRelationIds: true });
            if (!log) {
                return new Log();
            }
            return log;
        } catch (error: any) {
            throw new Error(error)
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
        newTask.id = log.getterIdCode;
        newTask.name = log.name;
        newTask.description = log.description;
        newTask.priority = PriorityLevels.LOW;
        newTask.status = log.status;
        newTask.done = log.done;
        newTask.timeSpent = log.timeSpent;
        newTask.deadline = log.deadline;
        newTask.createdAt = log.created_at;
        // Crie um array de subtasks a partir da string JSON
        // #TODO arrumar isso
        if (log.subtask) {
            newTask.subtask = this.JsonToSubtasks(log.subtask);
        } else {
            newTask.subtask = [];
        }

        let subtask_1 = new Subtask();
        let subtask_2 = new Subtask();
        let subtask_3 = new Subtask();

        subtask_1.id = 5;
        subtask_2.id = 20;
        subtask_3.id = 40;

        newTask.subtask = [subtask_1, subtask_2, subtask_3];
        newTask.userId = userId;

        return newTask;
    }


/**
 * Salva um registro de log no repositório.
 * @param logToSave O registro de log a ser salvo.
 * @returns Retorna o resultado da operação de salvamento.
 */
    public async saveLog(logToSave: Log) {
        try {
            const result = await this.logRepository.save(logToSave);
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Verifica se um registro de log já existe para uma tarefa específica com base no código do getter.
     * @param getterId O código do getter associado ao registro de log.
     * @param taskId O ID da tarefa à qual o registro de log está vinculado.
     * @returns Retorna um objeto indicando se o registro de log existe e, se sim, o ID do registro.
     */
    public async checkIfLogExists(getterId: string, taskId: number | string): Promise<{ doesLogExist: Boolean, logId: Number }> {
        try {
            const logs = await this.getAllLogsByTaskId(taskId);
            let exists = false;
            let logId = 0;
            if (logs) {
                // Encontre o primeiro objeto na matriz com daysAfterCreation igual a daysSinceCreation
                const foundLog = logs.find((log) => log.getterIdCode === getterId);
                if (foundLog) {
                    exists = true;
                    logId = foundLog.id;
                }
            }
            return { doesLogExist: exists, logId };
        } catch (error: any) {
            throw new Error(error);
        }

    }
    /**
     * Atualiza um registro de log existente com base em seu ID original.
     * @param updatedLog O registro de log atualizado a ser salvo.
     * @param originalLogId O ID do registro de log original a ser atualizado.
     */
    public async updateLog(updatedLog: Log, originalLogId: Number) {
        try {
            const updatedLogObject = this.logRepository.create(updatedLog);

            updatedLogObject.id = originalLogId.valueOf();
            await this.logRepository.save(updatedLogObject);


        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Converte um array de subtasks para uma representação JSON em formato de string.
     * @param subtasks O array de subtasks a ser convertido em JSON.
     * @returns Retorna uma string contendo a representação JSON das subtasks.
     */
    public subtaskToJson(subtasks: Subtask[]): string {
        try {
            const jsonSubtasks = JSON.stringify(subtasks);
            return jsonSubtasks;
        } catch (error: any) {
            throw new Error(error);
        }
    }
    /**
     * Converte uma string JSON em formato de string para um array de subtasks.
     * @param jsonString A string JSON a ser convertida em um array de subtasks.
     * @returns Retorna um array de subtasks.
     * @throws Lança uma exceção se o JSON não representar uma array de subtasks.
     */
    public JsonToSubtasks(jsonString: string): Subtask[] {
        try {
            const subtasks = JSON.parse(jsonString);
            if (Array.isArray(subtasks)) {
                return subtasks;
            } else {
                throw new Error("JSON não representa uma array de subtasks.");
            }
        } catch (error: any) {
            throw new Error(error);
        }
    }

}

export default new LogService();