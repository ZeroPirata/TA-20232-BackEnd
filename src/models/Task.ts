
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    ManyToMany,
    CreateDateColumn,
    JoinTable
} from "typeorm";
import { PriorityLevels } from "./PriorityLevels";
import { User } from "./User";
import { StatusLevels } from "./StatusLevels";
import { Subtask } from "./Subtask";
import { Log } from "./Log";

@Entity({ name: "task" })
export class Task {

    @PrimaryGeneratedColumn({
        type: "int",
    })
    id!: number | string;

    @Column({
        type: "varchar",
    })
    name!: string;

    @Column({
        type: "varchar",
        nullable: true,
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
        type: "int",
        nullable: true,
    })
    customInterval!: number;

    @CreateDateColumn({
        name: 'last_execution'
    })
    lastExecution!: Date; 

    @Column({ 
        type: "date"
    })
    deadline!: string;

    @CreateDateColumn({ name: 'created_at'})
    createdAt!: Date;

    @ManyToOne(() => User, (user) => user.tasks)
    userId!: number;

    @ManyToMany(() => Subtask, ( subtask) => subtask.task, { onDelete: "CASCADE" })
    @JoinColumn({name: "subtask_id"})
    subtask!: Subtask[];

    @ManyToMany(type => Log, { nullable:true })
    @JoinTable()
    logs!: Log[];
}
