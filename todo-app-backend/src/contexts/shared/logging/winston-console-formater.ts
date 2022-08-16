import * as winston from 'winston';
import { clc } from '@nestjs/common/utils/cli-colors.util';

export const formatWinstonConsole = (): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.ms(),
    winston.format.printf((info) => getFormatedMessageConsole(info)),
  );
};

const getFormatedMessageConsole = (info: any) => {
  const {
    timestamp,
    level,
    message,
    'log.origin.file.name': logOriginFileName,
    ms,
    err,
    ...args
  } = info;

  if (err) {
    delete err.response;
  }
  return (
    clc.cyanBright('[' + timestamp + '] ') +
    level +
    clc.yellow(' [' + logOriginFileName + '] ') +
    message +
    ' ' +
    (err ? JSON.stringify(err) : '') +
    (args ? JSON.stringify(args) : '') +
    clc.yellow(' ' + ms)
  );
};
