import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Todo } from '../../domain/todo.entity';
import { randomUUID } from 'crypto';
import { CreateTodoCommand } from '../create/create-todo.command';
import { DeleteTodoCommand } from './delete-todo.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@CommandHandler(DeleteTodoCommand)
export class DeleteTodoHandler implements ICommandHandler<CreateTodoCommand> {
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
