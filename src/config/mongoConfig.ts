import { DataSource} from 'typeorm';
import { MongoFutureTask, MongoTask } from '../models';

const entidades = [MongoTask, MongoFutureTask];

export const MongoDataSource = new DataSource({
            type: "mongodb",
            url: "mongodb+srv://arquiveirosdsm:mmmgna2023_@api20232.udt69pz.mongodb.net/?retryWrites=true&w=majority",
            database: "API",
            synchronize: true,
            logging: false,
            entities: entidades,
        })
        
