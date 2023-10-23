import { EntitySchema } from 'typeorm';
import {DatabaseType} from "../enums/data.base.enum";



export interface ITypeOrmConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string | (() => string) | (() => Promise<string>);
  database: string | Uint8Array;
  entities: (Function | string | EntitySchema<any>)[] | { [p: string]: Function | string | EntitySchema<any> };
  synchronize: boolean;
}

export const typeOrmConfig = (): ITypeOrmConfig => ({
  type: DatabaseType.Postgres,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD as string | (() => string) | (() => Promise<string>), // Предполагается, что PASSWORD будет всегда строкой или функцией/обещанием, которые возвращают строку
  database: process.env.DB_NAME as string | Uint8Array, // Предполагается, что DATABASE_NAME будет всегда строкой или Uint8Array
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  synchronize: true
});
