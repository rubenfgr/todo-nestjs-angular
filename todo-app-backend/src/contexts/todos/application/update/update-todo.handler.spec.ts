import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTodoHandler } from './update-todo.handler';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from '../../domain/todo.entity';
import { sqliteOptions } from '../../../../app.module';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { UpdateTodoCommand } from './update-todo.command';
import { BadRequestException } from '@nestjs/common';
import { validateSync } from 'class-validator';

describe('UpdateTodoHandler', () => {
  let handler: UpdateTodoHandler;
  let todoRepository: Repository<Todo>;
  let todo: Todo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ ...sqliteOptions, entities: [Todo] }),
        TypeOrmModule.forFeature([Todo]),
      ],
      providers: [UpdateTodoHandler],
    }).compile();

    handler = module.get<UpdateTodoHandler>(UpdateTodoHandler);
    todoRepository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  beforeEach(async () => {
    todo = new Todo();
    todo.id = randomUUID();
    todo.title = 'title';
    todo.description = 'description';
    todo.isCompleted = false;
    todo.order = 1;
    await todoRepository.save(todo);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('validate command ok', () => {
    const updateTodoCommand = new UpdateTodoCommand();
    const errors = validateSync(updateTodoCommand);
    expect(errors.length).toEqual(0);
  });

  it('validate command fails', async () => {
    const updateTodoCommand = new UpdateTodoCommand();
    updateTodoCommand.id = '';
    const errors = validateSync(updateTodoCommand);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('update todo, id not exists', async () => {
    const updateTodoCommand = new UpdateTodoCommand();

    await expect(async () => {
      await handler.execute(updateTodoCommand);
    }).rejects.toThrow(BadRequestException);
  });

  it('update todo ok', async () => {
    const updateTodoCommand = new UpdateTodoCommand();
    updateTodoCommand.id = todo.id;
    updateTodoCommand.title = 'updated';
    updateTodoCommand.description = 'updated';
    updateTodoCommand.isCompleted = true;
    updateTodoCommand.order = 2;

    const response = await handler.execute(updateTodoCommand);

    expect(response).toEqual(updateTodoCommand);
  });
});
