import { Test, TestingModule } from '@nestjs/testing';
import { CreateTodoHandler } from './create-todo.handler';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from '../../domain/todo.entity';
import { mockTodosRepository } from '../../domain/mocks/mock-todos-repository';

describe('CreateTodoHandler', () => {
  let handler: CreateTodoHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTodoHandler,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockTodosRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateTodoHandler>(CreateTodoHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });
});
