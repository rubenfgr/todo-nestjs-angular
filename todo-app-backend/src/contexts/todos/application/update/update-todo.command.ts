import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateTodoCommand } from '../create/create-todo.command';

export class UpdateTodoCommand extends PartialType(CreateTodoCommand) {
  @IsUUID()
  @IsOptional()
  id: string;
}
