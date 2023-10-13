
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    ManyToMany,
    CreateDateColumn,
    JoinTable,
    ObjectId,
    ObjectIdColumn,
    Index
} from "typeorm";
import { PriorityLevels } from "./PriorityLevels";
import { User } from "./User";
import { StatusLevels } from "./StatusLevels";
import { Subtask } from "./Subtask";
import { Log } from "./Log";

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

    @Column()
    userId!: number;

    @Column()
    subtask!: Subtask[];

}
