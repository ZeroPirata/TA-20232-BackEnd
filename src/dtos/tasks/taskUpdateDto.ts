import { StatusLevels } from "../../models/StatusLevels";
import { PriorityLevels } from "../../models/PriorityLevels";


export class TaskUpdateDto {

    name!: string

    description!: string

    priority!: PriorityLevels

    status!: StatusLevels

    done!: boolean

    customInterval!: number 

    lastExecution!: Date

    timeSpent!: number

    deadline!: string

    
}
