import { MongoRepository, Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Subtask, Task, User } from "../models";
import mongoose from "mongoose";
import subtaskService from "./subtaskService";
import { MongoDataSource } from "../config/mongoConfig";
import { MongoTask } from "../models/MongoTask";
import { StatusLevels } from "../models/StatusLevels";
import { MongoFutureTask } from "../models/MongoFutureTasks";
import moment, { Moment } from "moment-timezone";
import { create } from "domain";
import { IDynamicKeyData, IHistorico } from "../interfaces/historico";
import { TaskUpdateDto } from "../dtos/tasks/taskUpdateDto";
import { HistoricoTask } from "../models/MongoHisotirico";

class TaskService {
    private taskRepository: Repository<Task>;
    private mongoTaskRepository: Repository<MongoTask>;
    private mongoFutureTaskRepository: Repository<MongoFutureTask>;
    private mongoHistoricoRepository: MongoRepository<HistoricoTask>;

    constructor() {
        this.taskRepository = DataBaseSource.getRepository(Task);
        this.mongoTaskRepository = MongoDataSource.getMongoRepository(MongoTask);
        this.mongoFutureTaskRepository = MongoDataSource.getMongoRepository(MongoFutureTask);
        this.mongoHistoricoRepository = MongoDataSource.getMongoRepository(HistoricoTask);
    }

    public async createTask(task: Task) {
        try {
            const sharedUserIds: number[] = task.sharedUsersIds || [];
            const newTask = await this.taskRepository.save(task);
            for (const userId of sharedUserIds) {
                await DataBaseSource.getRepository("user_task").insert({ "userId": userId, "taskId": newTask.id });
            }
            return newTask;
        } catch (error) {
            return error;
        }
    }

    public async getAllTasks() {
        try {
            const allTasks = await this.taskRepository
                .createQueryBuilder("task")
                .where('task.customInterval IS NOT NULL AND task.customInterval = 0')
                .getMany();
            return allTasks;
        } catch (error) {
            return error;
        }
    }

    public async shareTask(taskId: number, usersIds: number[]) {
        try {
            const task = await this.taskRepository
                .createQueryBuilder("task")
                .leftJoinAndSelect("task.users", "users")
                .where("task.id = :taskId", { taskId })
                .getOne();
            const users = task?.users

            let usersRemove = []
            for (const user of users as User[]){
                if(!usersIds.includes(user.id)){
                    usersRemove.push(user.id)
                }
            }
            await this.stopTaskSharing(taskId, usersRemove)

            const successfullyInsertedIds = [];
            for (const userId of usersIds) {
                try {
                    const result = await DataBaseSource.getRepository("user_task").insert({ userId: userId, taskId: taskId })
                    successfullyInsertedIds.push(result.identifiers[0].id);
                } catch (error: any) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        console.log(`Duplicate entry: UserId: ${userId} and taskId: ${taskId}`);
                    } else {
                        console.log(`Error to insert: UserId: ${userId} and taskId: ${taskId}`, error);
                    }
                }
            }
            return successfullyInsertedIds;
        } catch (error) {
            return error;
        }
    }

    public async getAllSharedTasks() {
        try {
            const allTasks = await this.taskRepository
                .createQueryBuilder("task")
                .where('task.sharedUsersIds IS NOT NULL')
                .getMany();
            return allTasks;
        } catch (error) {
            return error;
        }
    }

    public async stopTaskSharing(taskId: number, usersIds: number[]) {
        try {
            for (const userId of usersIds) {
                await DataBaseSource.getRepository("user_task").delete({taskId: taskId, userId: userId})
            }
            return
        } catch (error) {
            return error;
        }
    }

    public async getTaskById(id: number) {
        try {
            const task = await this.taskRepository.findOne({ where: { id } });
            if (!task) {
                return null;
            }
            return task;
        } catch (error) {
            return error;
        }
    }

    public async getExpiredTasks(userId: number, date: string): Promise<{ recorrente: any[], naoRecorrente: any[], error?: unknown }> {
        try {
            let tasks: any = []
            tasks = await this.taskRepository
                .createQueryBuilder("task")
                .where("task.userId = :userId", { userId })
                .andWhere("task.deadline = :date", { date })
                .getMany();
            const recorente = tasks.filter((task: Task) => { return task.customInterval > 0 })
            const naoRecorente = tasks.filter((task: Task) => { return task.customInterval === 0 })
            const pastCycleTasks = await this.mongoTaskRepository.find({ where: { userId: userId, deadline: date } });
            const futureCycleTasks = await this.mongoFutureTaskRepository.find({ where: { userId: userId, deadline: date } });
            const retorno = { recorrente: [...recorente, ...pastCycleTasks, ...futureCycleTasks], naoRecorrente: [...naoRecorente] };
            return retorno
        } catch (error) {
            console.log(error)
            return { recorrente: [], naoRecorrente: [] };
        }
    }

    public async getTimeSpentByMonth(userId: number, month: number) {
        try {
            let tasks: Task[] = await this.taskRepository
                .createQueryBuilder("task")
                .where("task.userId = :userId", { userId })
                .andWhere("MONTH(task.deadline) = :month", { month })
                .getMany();
            let timeSpent = 0;
            tasks.forEach(task => {
                timeSpent += task.timeSpent;
            });

            return timeSpent;
        } catch (error) {
            return error;
        }
    }

    public async getTimeSpentMonthly(userId: number, year: number) {
        try {
            const tasks: Task[] = await this.taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .andWhere('DATE_FORMAT(task.createdAt, "%Y-%m-%d") BETWEEN :start AND :end', {
                    start: `${year}-01-01`,
                    end: `${year}-12-31`
                })
                .getMany();

            const monthlyTimeSpent: { [month: string]: number } = {};

            tasks.forEach((task) => {
                const createdAt = task.createdAt;
                const month = createdAt.toLocaleString('en-US', { month: 'long' });
                const timeSpent = task.timeSpent;

                if (!monthlyTimeSpent[month]) {
                    monthlyTimeSpent[month] = 0;
                }

                monthlyTimeSpent[month] += timeSpent;
            });

            return monthlyTimeSpent;
        } catch (error) {
            throw error;
        }
    }

    public async getAllNonCyclicTasks(userId: number) {
        try {
            const tasks = await this.taskRepository
                .createQueryBuilder("task")
                .leftJoinAndSelect("task.users", "users")
                .addSelect(["users.email"])
                .where("task.userId = :userId", { userId })
                .getMany();
            const nonCyclicTasks = tasks.filter((task) => { return task.customInterval === 0 })
            return nonCyclicTasks
        } catch (error) {
            return error;
        }
    }

    public async updateTask(id: number, task: Task) {
        try {
            const updatedTask = await this.taskRepository.update(id, task);
            if (!updatedTask.affected) {
                throw new Error("Task not found");
            }
            return updatedTask;
        } catch (error) {
            return error;
        }
    }

    public async getAllCyclicTasks(userId: number) {
        try {
            const tasks = await this.taskRepository.find({ where: { userId: userId } })
            const cyclicTasks = tasks.filter((task) => { return task.customInterval > 0 })
            return cyclicTasks
        } catch (error) {
            console.log(error)
            return []
        }
    }

    public async checkTaskToRenew(cyclicTaks: Task[]) {
        try {
            const today = moment(new Date()).format("YYYY-MM-DD");
            const tasksToRenew = cyclicTaks.filter((task) => { return moment(task.lastExecution).add(task.customInterval, "days").format("YYYY-MM-DD") == today });
            return tasksToRenew;
        } catch (error) {
            console.log(error)
            return []
        }
    }



    public async updateTasktimeSpent(id: number, timeSpent: number) {
        try {
            const updatedTask = await this.taskRepository.update(id, { timeSpent });
            if (!updatedTask.affected) {
                throw new Error("Task not found");
            }
            return updatedTask;
        } catch (error) {
            return error;
        }
    }

    public async deleteTask(id: number) {
        const mongoFutureTaskRepository = MongoDataSource.getMongoRepository(MongoFutureTask);
        const mongoTaskRepository = MongoDataSource.getMongoRepository(MongoTask);

        try {
            const deletedTask = await this.taskRepository.delete(id);
            mongoTaskRepository.deleteMany({ "taskId": id });
            mongoFutureTaskRepository.deleteMany({ "taskId": id });

            if (!deletedTask.affected) {
                throw new Error("Task not found");
            }
            return deletedTask;
        } catch (error) {
            return error;
        }
    }

    public async refreshTask(taskId: number) {
        try {
            const task = await this.taskRepository.findOne({ where: { id: taskId } });
            if (!task) {
                throw new Error("Task not found");
            }
            let subtasks = await subtaskService.getSubtasksByTask(taskId) as Subtask[];
            subtasks.forEach(subtask => {
                subtask.done = false;
                subtaskService.updateSubtask(subtask.id, subtask);
            });


            task.lastExecution = new Date();
            task.done = false;
            task.status = StatusLevels.TODO;
            task.deadline = moment(new Date()).tz('America/Sao_Paulo').format("YYYY-MM-DD")

            const updatedTask = await this.taskRepository.update(taskId, task);
            if (!updatedTask.affected) {
                throw new Error("Task not found");
            }
            return updatedTask;

        } catch (error) {
            return error;
        }
    }

    public async deleteFutureTask(taskId: number) {
        try {
            const task = await this.taskRepository.findOne({ where: { id: taskId } });
            if (!task) {
                throw new Error("Task not found");
            }

            const today = moment(new Date()).tz('America/Sao_Paulo')
            const deletedTask = await this.mongoFutureTaskRepository.delete({ taskId: taskId, deadline: today.format("YYYY-MM-DD") });
            if (!deletedTask.affected) {
                throw new Error("Task not found");
            }
            return deletedTask;
        } catch (error) {
            return error;
        }
    }

    public async deleteAllFutureTasks(taskId: number) {
        try {
            const deletedTask = await this.mongoFutureTaskRepository.delete({ taskId: taskId });
            if (!deletedTask.affected) {
                throw new Error("Task not found");
            }
            return deletedTask;
        } catch (error) {
            console.log(error)
            return error;
        }
    }

    public async cloneTask(taskId: number) {
        try {
            const task = await this.taskRepository.findOne({ where: { id: taskId } });
            if (!task) {
                throw new Error("Task not found");
            }

            task.subtask = await subtaskService.getSubtasksByTask(taskId) as Subtask[];

            const newTask = new MongoTask();

            // Transformando Task em MongoTask
            newTask.id = new mongoose.Types.ObjectId().toString();
            newTask.createdAt = task.createdAt;
            newTask.customInterval = task.customInterval;
            newTask.deadline = task.deadline;
            newTask.description = task.description;
            newTask.done = task.done;
            newTask.lastExecution = task.lastExecution;
            newTask.name = task.name;
            newTask.priority = task.priority;
            newTask.status = task.status;
            newTask.subtask = task.subtask;
            newTask.taskId = task.id;
            newTask.timeSpent = task.timeSpent;
            newTask.subtask = task.subtask;
            newTask.userId = task.userId;
            newTask.users = task.users;

            const createTask = await this.mongoTaskRepository.save(newTask);
            return createTask;

        } catch (error) {
            console.log(error);
            return error;
        }
    }

    public async createFutureTasks(task: Task) {
        try {
            const taskInfo = await this.taskRepository.findOne({ where: { id: task.id } });
            if (!taskInfo) {
                throw new Error("Task not found");
            }
            taskInfo.subtask = await subtaskService.getSubtasksByTask(taskInfo.id as number) as Subtask[];

            let createdDate: string | Moment
            createdDate = moment(taskInfo.createdAt).tz('America/Sao_Paulo').format("YYYY-MM-DD");
            let today = moment(new Date()).tz('America/Sao_Paulo').format("YYYY-MM-DD");

            if (createdDate != today) {
                createdDate = moment(new Date());

            } else {
                createdDate = moment(taskInfo.createdAt)
            }


            const futureTasks = [];

            for (let index = 0; index < 30; index++) {
                const newTask = new MongoFutureTask();
                createdDate.add(taskInfo.customInterval, 'days').tz('America/Sao_Paulo').format("YYYY-MM-DD");

                // Transformando Task em MongoTask
                newTask.createdAt = taskInfo.createdAt;
                newTask.customInterval = taskInfo.customInterval;
                newTask.id = new mongoose.Types.ObjectId().toString();
                newTask.deadline = createdDate.tz('America/Sao_Paulo').format("YYYY-MM-DD");
                newTask.description = taskInfo.description;
                newTask.done = taskInfo.done;
                newTask.lastExecution = taskInfo.lastExecution;
                newTask.name = taskInfo.name;
                newTask.priority = taskInfo.priority;
                newTask.status = StatusLevels.TODO;
                newTask.subtask = taskInfo.subtask;
                newTask.taskId = taskInfo.id;
                newTask.timeSpent = taskInfo.timeSpent;
                newTask.userId = taskInfo.userId;

                futureTasks.push(newTask);

            }

            await this.mongoFutureTaskRepository.save(futureTasks);

            return futureTasks;

        } catch (error) {
            console.log(error);
            return error;
        }
    }

    public async updateFutureTasks(task: Task) {
        try {
            await this.deleteAllFutureTasks(task.id as number);
            const futureTasks = await this.createFutureTasks(task);
            return futureTasks
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    public async getTasksByUserId(userId: number): Promise<Task[]> {
        try {
            const tasks = await this.taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .getMany();

            return tasks;
        } catch (error: unknown) {
            throw new Error(error as string);
        }
    }

    public async HistoricEditTask(idTask: number, taskUpdate: TaskUpdateDto, user: { name: string, id: number }) {
        try {
            let historicoEdit: IHistorico = {
                taskId: idTask,
                user,
                data: new Date().toISOString(),
                campo: {}
            };
            const fields = ["name", "description", "priority", "status", "done", "customInterval", "lastExecution", "timeSpent", "deadline"];
            const task = await this.taskRepository.findOne({ where: { id: idTask } });
            if (task) {
                for (const field of fields) {
                    if ((taskUpdate as any)[field] !== undefined && (task as any)[field] !== (taskUpdate as any)[field]) {
                        historicoEdit.campo[field] = {
                            old: (task as any)[field],
                            new: (taskUpdate as any)[field]
                        };
                    }
                }
                const save = await this.mongoHistoricoRepository.save(historicoEdit);
                return save;
            }
            return historicoEdit
        } catch (error: any) {
            throw new Error(error);
        }
    }

    public async getHistoricEditTask(idTask: number): Promise<IDynamicKeyData> {
        try {
            const findTask = await this.mongoHistoricoRepository.find({ where: { "taskId": { $eq: idTask } } })
            const grupoDatas: IDynamicKeyData = {};
            findTask.forEach((task) => {
                const data = task.data.slice(0, 10);
                if (!grupoDatas[data]) {
                    grupoDatas[data] = [];
                }
                grupoDatas[data].push(task);
            });
            return grupoDatas;
        } catch (error: any) {
            throw new Error(error)
        }
    }

    public async getHistoricTaskByUser(idUser: number): Promise<IDynamicKeyData> {
        try {
            const tasks = await this.taskRepository.findBy({ userId: idUser });
            const search = await this.mongoHistoricoRepository.find({ where: { "user.id": { $eq: idUser } } });
            const taskIdsSet = new Set(tasks.map(task => task.id));
            const filteredSearch = search.filter(mongoTask => !taskIdsSet.has(mongoTask.taskId));
            filteredSearch.sort((a: IHistorico, b: IHistorico) => {
                const dataA = new Date(a.data).getTime();
                const dataB = new Date(b.data).getTime();
                return dataB - dataA;
            });
            const grupoDatas: IDynamicKeyData = {};
            filteredSearch.forEach(task => {
                const data = task.data.slice(0, 10);
                if (!grupoDatas[data]) {
                    grupoDatas[data] = [];
                }
                grupoDatas[data].push(task);
            });
            return grupoDatas;
        } catch (error: any) {
            throw new Error(error)
        }
    }

    public async getHistoricTaskByOwner(idUser: number) {
        const tasks = await this.taskRepository.findBy({ userId: idUser });
        const grupoNames: IDynamicKeyData = {};
        const listIds = tasks.map(task => ({ id: task.id, name: task.name }));
        const historicTaskPromises = listIds.map(async (task) => {
            const historicTasks = await this.mongoHistoricoRepository.find({ where: { taskId: task.id } });
            return historicTasks;
        });
        const historicTaskByOwner = (await Promise.all(historicTaskPromises)).flat();
        historicTaskByOwner.forEach(task => {
            const taskName = listIds.find(filterTask => filterTask.id === task.taskId)?.name;
            if (taskName) {
                if (!grupoNames[taskName]) {
                    grupoNames[taskName] = [];
                }
                grupoNames[taskName].push(task);
            }
        });
        return grupoNames;
    }

    public async getSharedTasksByUserId(userId: number): Promise<Task[]> {
        try {
            const tasks = await this.taskRepository
                .createQueryBuilder('task')
                .innerJoinAndSelect('task.users', 'user')
                .where('user.id = :userId', { userId })
                .getMany();

            return tasks;
        } catch (error: unknown) {
            throw new Error(error as string);
        }
    }

}

export default new TaskService();