import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { Task } from "./Task";
@Entity({name: "sub_task"})
export class Subtask {

    @PrimaryGeneratedColumn({
        type: "int",
    })
    id!: number;

    @Column({
        type: "varchar",
    })
    name!: string;

    @Column({
        type: "boolean"
    })
    done!: boolean;

    @ManyToOne(() => Task, (task) => task.subtasks)
    task!: Task;

    

}