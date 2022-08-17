import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Todo } from '../../domain/todo.entity';
import { DeleteTodoCommand } from './delete-todo.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@CommandHandler(DeleteTodoCommand)
export class DeleteTodoHandler implements ICommandHandler<DeleteTodoCommand> {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  async execute(command: DeleteTodoCommand): Promise<number> {
    // USE CASE LOGIC
    const result = await this.todosRepository.delete({ id: command.id });
    return result.affected;
  }
}
