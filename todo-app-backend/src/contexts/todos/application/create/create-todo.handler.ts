import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTodoCommand } from './create-todo.command';
import { Todo } from '../../domain/todo.entity';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@CommandHandler(CreateTodoCommand)
export class CreateTodoHandler implements ICommandHandler<CreateTodoCommand> {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  async execute(command: CreateTodoCommand): Promise<Todo> {
    // USE CASE LOGIC
    const todo = new Todo();
    todo.id = randomUUID();
    todo.title = command.title;
    todo.description = command.description;
    todo.isCompleted = command.isCompleted;
    todo.order = command.order;
    return this.todosRepository.save(todo);
  }
}
