import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany
} from "typeorm";
import { PriorityLevels } from "./PriorityLevels";
import { User } from "./User";
import { StatusLevels } from "./statusLevels";
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
    status!: PriorityLevels;

    @Column()
    done!: boolean;

    @Column({
        type: "number"
    })
    timeSpent!: number;

    @Column({
        type: "date"
    })
    deadline!: string;

    @ManyToOne(() => User, (user) => user.tasks)
    user!: User;

    @OneToMany(() => Subtask, (subtask) => subtask.task)
    subtasks!: Subtask[];

}