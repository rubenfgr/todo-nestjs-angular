import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './domain/todo.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateTodoHandler } from './application/create/create-todo.handler';
import { DeleteTodoHandler } from './application/delete/delete-todo.handler';
import { FindTodosByCriteriaHandler } from './application/findByCriteria/find-todos-by-criteria.handler';
import { UpdateTodoHandler } from './application/update/update-todo.handler';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Todo]), CqrsModule, SharedModule],
  controllers: [TodosController],
  providers: [
    CreateTodoHandler,
    DeleteTodoHandler,
    FindTodosByCriteriaHandler,
    UpdateTodoHandler,
  ],
})
export class TodosModule {}
