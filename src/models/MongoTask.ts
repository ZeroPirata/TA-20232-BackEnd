import {
    Entity,
    Column,
    CreateDateColumn,
    ObjectIdColumn,
    Index
} from "typeorm";
import { PriorityLevels } from "./PriorityLevels";
import { StatusLevels } from "./StatusLevels";
import { Subtask } from "./Subtask";
import { User } from "./User";


@Entity("task")
@Index(["taskId", "userId"])
export class MongoTask {

    @ObjectIdColumn()
    id!:  string;

    @Column()
    taskId!: number | string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    priority!: PriorityLevels;

    @Column()
    status!: StatusLevels; 

    @Column()
    done!: boolean;

    @Column()
    timeSpent!: number;

    @Column()
    customInterval!: number;

    @CreateDateColumn()
    lastExecution!: Date; 

    @Column()
    deadline!: string;

    @CreateDateColumn({ name: 'created_at'})
    createdAt!: Date;

    @Column({
        type: "int",
    })
    userId!: number;

    @Column({default: []})
    users?: User[] = [];

    @Column()
    subtask!: Subtask[];

}
