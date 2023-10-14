import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Task } from "./Task";
@Entity({name: "subtask"}) 
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

    @ManyToOne(() => Task, (task) => task.subtask, { onDelete: "CASCADE" })
    @JoinColumn({name: "task_id"})
    task!: Task;


}