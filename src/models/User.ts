import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from "typeorm";
import { Task } from "./Task";

@Entity({ name: "user" })
export class User {

    @PrimaryGeneratedColumn({
        type: "int",
    })
    id!: number;

    @Column({
        type: "varchar"
    })
    name!: string;

    @Column({
        type: "varchar"
    })
    email!: string;

    @Column({
        type: "varchar"
    })
    password!: string;

    @OneToMany(() => Task, (task) => task.user)
    tasks!: Task[];
    static id: string;
}