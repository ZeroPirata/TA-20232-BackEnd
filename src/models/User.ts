import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    BeforeInsert,
    BeforeUpdate,
} from "typeorm";
import { Task } from "./Task";
import * as bcrypt from "bcrypt"


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