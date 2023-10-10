
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    ManyToMany,
    CreateDateColumn,
    PrimaryColumn
} from "typeorm";
import { PriorityLevels } from "./PriorityLevels";
import { User } from "./User";
import { StatusLevels } from "./StatusLevels";
import { Subtask } from "./Subtask";
import { Task } from "./Task";

@Entity({ name: "log"})
export class Log {
    @PrimaryGeneratedColumn({
        type: "int",
    })
    id!: number;

    @Column({
        type: "varchar",
    }) 
    name!: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    description!: string;

    @Column({
        type: "enum",
        enum: StatusLevels,
        default: StatusLevels.TODO
    })
    status!: StatusLevels;

    @Column()
    done!: boolean

    @Column({
        type: "int"
    })
    timeSpent!: number;

    @CreateDateColumn({
        name: 'created_at'
    })
    created_at!: Date;

    @Column({
        type: "date"
    })
    deadline!: string;

    @ManyToOne(() => Task, (task) => task.logs)
    @JoinColumn({name: "parent_task_id"})
    parentTask!: Task;

    @Column({
        type: 'simple-json',
        nullable: true
    })
    subtask!: string;

    @Column({
        type: 'int'
    })
    daysAfterCreation!: number;
}