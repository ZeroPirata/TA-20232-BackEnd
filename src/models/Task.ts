import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";
import { PriorityLevels } from "./PriorityLevels";
@Entity({ name: "task" })
export class Task {

    @PrimaryGeneratedColumn({
        type: "int",
    })
    task_id!: number;

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

    @Column()
    done!: boolean;

    @Column({
        type: "number"
    })
    timeSpent!: number;

    @Column({
        type: "date"
    })
    expirationDate!: string;
}