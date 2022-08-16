import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiTags } from '@nestjs/swagger';
import { Todo } from './entities/todo.entity';
import {
  ApiErrorDataResponse,
  ApiOkMultipleDataResponse,
  ApiOkNumberDataResponse,
  ApiOkStringDataResponse,
} from '../shared/decorators/api-response-decorators';
import {
  ApiMultipleResponseDto,
  ApiResponseStatus,
  ApiSingleResponseDto,
} from '../shared/models/api-multiple-response.dto';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @ApiOkStringDataResponse()
  @ApiErrorDataResponse()
  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<ApiSingleResponseDto<string>> {
    console.log(createTodoDto);
    const todo = await this.todosService.create(createTodoDto);
    return {
      status: ApiResponseStatus.OK,
      message: 'La tarea se creo correctamente',
      data: todo.id,
    };
  }

  @ApiOkMultipleDataResponse(Todo)
  @ApiErrorDataResponse()
  @Get()
  async findAll(): Promise<ApiMultipleResponseDto<Todo>> {
    const todos = await this.todosService.findAll();
    return {
      status: ApiResponseStatus.OK,
      data: todos,
    };
  }

  @ApiOkStringDataResponse()
  @ApiErrorDataResponse()
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSingleResponseDto<Todo>> {
    console.log(id);
    const todo = await this.todosService.findOne(id);
    return {
      status: ApiResponseStatus.OK,
      data: todo,
    };
  }

  @ApiOkStringDataResponse()
  @ApiErrorDataResponse()
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<ApiSingleResponseDto<string>> {
    updateTodoDto.id = id;
    console.log(updateTodoDto);
    const todo = await this.todosService.update(updateTodoDto);
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
    console.log(id);
    return {
      status: ApiResponseStatus.OK,
      data: await this.todosService.remove(id),
    };
  }
}
