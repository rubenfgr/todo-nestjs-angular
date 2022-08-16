import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = new Todo();
    todo.id = randomUUID();
    todo.title = createTodoDto.title;
    todo.description = createTodoDto.description;
    todo.isCompleted = createTodoDto.isCompleted;
    todo.order = createTodoDto.order;
    return await this.todoRepository.save(todo);
  }

  async findAll(): Promise<Todo[]> {
    return await this.todoRepository.find();
  }

  async findOne(id: string): Promise<Todo> {
    return await this.todoRepository.findOne({ where: { id } });
  }

  async update(updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const { id, ...data } = updateTodoDto;
    let todo = await this.findOne(id);
    todo = { ...todo, ...data };
    return await this.todoRepository.save(todo);
  }

  async remove(id: string): Promise<number> {
    const deleteResult = await this.todoRepository.delete({ id });
    return deleteResult.affected;
  }
}
