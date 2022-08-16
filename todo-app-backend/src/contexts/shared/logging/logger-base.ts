import * as winston from 'winston';

export abstract class LoggerBase {
  protected logger: winston.Logger;
  protected originFileName: string;

  protected abstract createWinstonLogger(): winston.Logger;

  /**
   * Level 0
   */
  error(id: string, message: string, err: any): void {
    this.logger.error(
      LoggerBase.addDataToMessage(message, { id }),
      LoggerBase.formatEcsData(this.originFileName, err),
    );
  }

  /**
   * Level 1
   */
  warn(message: string, data: any): void {
    this.logger.warn(
      LoggerBase.addDataToMessage(message, data),
      LoggerBase.formatEcsData(this.originFileName),
    );
  }

  /**
   * Level 2
   */
  info(message: string, data: any): void {
    this.logger.info(
      LoggerBase.addDataToMessage(message, data),
      LoggerBase.formatEcsData(this.originFileName),
    );
  }

  /**
   * Level 3
   */
  http(message: string, data: any): void {
    this.logger.http(
      LoggerBase.addDataToMessage(message, data),
      LoggerBase.formatEcsData(this.originFileName),
    );
  }

  /**
   * Level 4
   */
  verbose(message: string, data: any): void {
    this.logger.verbose(
      LoggerBase.addDataToMessage(message, data),
      LoggerBase.formatEcsData(this.originFileName),
    );
  }

  /**
   * Level 5
   */
  debug(message: string, data: any): void {
    this.logger.debug(
      LoggerBase.addDataToMessage(message, data),
      LoggerBase.formatEcsData(this.originFileName),
    );
  }

  /**
   * Level 6
   */
  silly(message: string, data: any): void {
    this.logger.silly(
      LoggerBase.addDataToMessage(message, data),
      LoggerBase.formatEcsData(this.originFileName),
    );
  }

  private static addDataToMessage(message: string, data?: any) {
    console.log(data);
    if (data) {
      return `${message} ${JSON.stringify(data)}`;
    }
    return message;
  }

  /**
   * ECS Field Reference
   * https://www.elastic.co/guide/en/ecs/8.1/ecs-field-reference.html
   *
   * Fields Selected:
   * {
   *     "@timestamp": "2020-04-01T12:00:00.000Z", // default base ECS
   *     "message": "message", // default base ECS, added metadata at the end
   *     "log.level": "error", // default base ECS
   *     "log.origin.file.name": // added
   *     "log.logger": // added
   *     "agent.name": "app-logs-nest-example", // default base ECS, prefix_pattern in docker-compose.yml or .env
   *
   *     To add errors:
   *     "err": // optional, ECS autoconverted from Error or Exception
   * }
   *
   */
  private static formatEcsData(originFileName: string, err?: any) {
    const dataFormated = {
      'log.origin.file.name': originFileName,
    };

    if (err) {
      dataFormated['err'] = err;
    }

    return dataFormated;
  }
}
