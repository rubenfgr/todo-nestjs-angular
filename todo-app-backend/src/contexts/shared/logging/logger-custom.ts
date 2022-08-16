import * as winston from 'winston';
import { LoggerBase } from './logger-base';
import 'winston-daily-rotate-file';
import { formatWinstonConsole } from './winston-console-formater';
import ecsFormat = require('@elastic/ecs-winston-format');

export class LoggerCustom extends LoggerBase {
  constructor(originFileName: string) {
    super();
    super.originFileName = originFileName;
    super.logger = this.createWinstonLogger();
  }

  protected createWinstonLogger() {
    return winston.createLogger({
      defaultMeta: { 'log.logger': 'customLogger' },
      format: ecsFormat(),
      transports: [
        new winston.transports.DailyRotateFile({
          level: 'silly',
          dirname: 'logs/custom',
          filename: 'custom-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new winston.transports.Console({
          level: 'silly',
          format: formatWinstonConsole(),
        }),
      ],
    });
  }
}
