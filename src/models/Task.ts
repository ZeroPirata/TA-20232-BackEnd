
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    ManyToMany,
    CreateDateColumn
} from "typeorm";
import { PriorityLevels } from "./PriorityLevels";
import { User } from "./User";
import { StatusLevels } from "./StatusLevels";
import { Subtask } from "./Subtask";

@Entity({ name: "task" })
export class Task {

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
    })
    description!: string;

    @Column({
        type: "enum",
        enum: PriorityLevels,
        default: PriorityLevels.LOW,
    })
    priority!: PriorityLevels;

    @Column({
        type: "enum",
        enum: StatusLevels,
        default: StatusLevels.TODO,
    })
    status!: StatusLevels; 

    @Column()
    done!: boolean;

    @Column({
        type: "int"
    })
    timeSpent!: number;

    @Column({
        type: "date"
    })
    deadline!: string;

    @CreateDateColumn({ name: 'created_at'})
    createdAt!: Date;


    @ManyToOne(() => User, (user) => user.tasks)
    userId!: number;

    @ManyToMany(() => Subtask, (subtask) => subtask.task)
    @JoinColumn({name: "subtask_id"})
    subtask!: Subtask[];

}
