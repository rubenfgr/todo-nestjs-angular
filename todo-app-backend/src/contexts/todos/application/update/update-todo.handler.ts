import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Todo } from '../../domain/todo.entity';
import { UpdateTodoCommand } from './update-todo.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, HttpStatus } from '@nestjs/common';

@CommandHandler(UpdateTodoCommand)
export class UpdateTodoHandler implements ICommandHandler<UpdateTodoCommand> {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  async execute(command: UpdateTodoCommand): Promise<Todo> {
    // USE CASE LOGIC
    const todo = await this.todosRepository.findOneById(command.id);
    if (!todo) {
      throw new BadRequestException(
        HttpStatus.BAD_REQUEST,
        'El id de la tarea no existe',
      );
    }
    todo.title = command.title;
    todo.description = command.description;
    todo.isCompleted = command.isCompleted;
    todo.order = command.order;
    return this.todosRepository.save(todo);
  }
}
