import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @IsUUID()
  @IsOptional()
  id: string;
}
