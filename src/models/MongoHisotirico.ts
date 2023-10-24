import {Entity, ObjectIdColumn, ObjectId, Column, Index} from "typeorm";

@Entity("historico_task")
@Index(["id", "user"])
export class HistoricoTask {
  @ObjectIdColumn()
  id!: ObjectId;

  @Column()
  taskId!: number;

  @Column()
  user!: {id: number; name: string};

  @Column()
  data!: string;

  @Column()
  campo!: Record<string, {new: string; old: string}>;
}
