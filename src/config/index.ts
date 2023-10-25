import { ITypeOrmConfig, typeOrmConfig} from "./typeOrm.config";
import {crosConfig, ICrosConfig} from "./cros.config";


export interface IConfig {
  port: number;
  database: ITypeOrmConfig;
  cros: ICrosConfig;
}

export const configuration = (): Partial<IConfig> => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: typeOrmConfig(),
  cros: crosConfig(),
});