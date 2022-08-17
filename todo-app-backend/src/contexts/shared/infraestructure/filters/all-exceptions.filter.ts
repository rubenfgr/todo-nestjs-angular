import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiResponseStatus,
  ApiSingleErrorResponseDto,
} from '../rest/api-responses.dto';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { LoggerApp } from '../logging/logger-app';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  private readonly loggerApp = new LoggerApp(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const id = randomUUID();

    const responseBody: ApiSingleErrorResponseDto = {
      status: ApiResponseStatus.KO,
      message: 'Error interno en el servidor',
      data: {
        id,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: exception.message,
      },
    };

    if (exception instanceof HttpException && exception.getResponse()) {
      const exceptionResponse: any = exception.getResponse();
      if (Array.isArray(exceptionResponse.message)) {
        responseBody.data.errors = exceptionResponse.message;
        exceptionResponse.message = 'Datos inválidos';
      }
      responseBody.message = exceptionResponse.message;
      responseBody.data.statusCode = exceptionResponse.statusCode;
      responseBody.data.error = exceptionResponse.error;
    }

    this.loggerApp.error(id, exception.message, exception);

    return response.status(200).json(responseBody);
  }
}
