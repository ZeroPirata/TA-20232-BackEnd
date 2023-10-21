import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinTable,
    ManyToMany,
} from "typeorm";
import { User } from "./User";
import { Task } from "./Task";

@Entity({ name: "user_task" }) 
export class UserTask {
    @PrimaryGeneratedColumn({
        type: "int",
    })
    id!: number | string;

    @ManyToOne(() => User, user => user.tasks, { eager: true })
    user!: User;

    @ManyToOne(() => Task, task => task.userId, { eager: true })
    task!: Task;
}
