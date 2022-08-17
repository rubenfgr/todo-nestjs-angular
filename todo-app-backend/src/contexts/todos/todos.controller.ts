import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Todo } from './domain/todo.entity';
import {
  ApiErrorDataResponse,
  ApiOkMultipleDataResponse,
  ApiOkNumberDataResponse,
  ApiOkStringDataResponse,
} from '../shared/infraestructure/decorators/api-response-decorators';
import {
  ApiResponsesDto,
  ApiResponseStatus,
  ApiSingleResponseDto,
} from '../shared/infraestructure/rest/api-responses.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTodoCommand } from './application/create/create-todo.command';
import { FindTodosByCriteriaQuery } from './application/findByCriteria/find-todos-by-criteria.query';
import { DeleteTodoCommand } from './application/delete/delete-todo.command';
import { validate } from 'class-validator';
import { UpdateTodoCommand } from './application/update/update-todo.command';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOkStringDataResponse()
  @ApiErrorDataResponse()
  @Post()
  async create(
    @Body() command: CreateTodoCommand,
  ): Promise<ApiSingleResponseDto<string>> {
    const todo = await this.commandBus.execute(command);
    return {
      status: ApiResponseStatus.OK,
      message: 'La tarea se creo correctamente',
      data: todo.id,
    };
  }

  @ApiOkMultipleDataResponse(Todo)
  @ApiErrorDataResponse()
  @Get()
  async findAll(
    @Query() query: FindTodosByCriteriaQuery,
  ): Promise<ApiResponsesDto<Todo>> {
    const { data, total } = await this.queryBus.execute(query);
    return {
      status: ApiResponseStatus.OK,
      data,
      total,
    };
  }

  @ApiOkStringDataResponse()
  @ApiErrorDataResponse()
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() command: UpdateTodoCommand,
  ): Promise<ApiSingleResponseDto<string>> {
    command.id = id;
    const todo = await this.commandBus.execute(command);
    return {
      status: ApiResponseStatus.OK,
      data: todo.id,
    };
  }

  @ApiOkNumberDataResponse()
  @ApiErrorDataResponse()
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSingleResponseDto<number>> {
    const deleteTodoCommand = new DeleteTodoCommand();
    deleteTodoCommand.id = id;
    await validate(deleteTodoCommand);
    return {
      status: ApiResponseStatus.OK,
      data: await this.commandBus.execute(deleteTodoCommand),
    };
  }
}
