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
  create(@Body() createTodoDto: CreateTodoDto): ApiSingleResponseDto<string> {
    console.log(createTodoDto);
    const todoId = this.todosService.create(createTodoDto);
    return {
      status: ApiResponseStatus.OK,
      message: 'La tarea se creo correctamente',
      data: todoId,
    };
  }

  @ApiOkMultipleDataResponse(Todo)
  @ApiErrorDataResponse()
  @Get()
  findAll(): ApiMultipleResponseDto<Todo> {
    const todos = this.todosService.findAll();
    return {
      status: ApiResponseStatus.OK,
      data: [],
    };
  }

  @ApiOkStringDataResponse()
  @ApiErrorDataResponse()
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): ApiSingleResponseDto<string> {
    console.log(id);
    const todoId = this.todosService.findOne(+id);
    return {
      status: ApiResponseStatus.OK,
      data: todoId,
    };
  }

  @ApiOkStringDataResponse()
  @ApiErrorDataResponse()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): ApiSingleResponseDto<string> {
    updateTodoDto.id = id;
    console.log(updateTodoDto);
    const todoId = this.todosService.update(+id, updateTodoDto);
    return {
      status: ApiResponseStatus.OK,
      data: todoId,
    };
  }

  @ApiOkStringDataResponse()
  @ApiErrorDataResponse()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    console.log(id);
    const todoId = this.todosService.remove(+id);
    return {
      status: ApiResponseStatus.OK,
      data: todoId,
    };
  }
}
