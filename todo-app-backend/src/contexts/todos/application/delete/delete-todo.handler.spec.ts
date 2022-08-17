import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTodoHandler } from './delete-todo.handler';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from '../../domain/todo.entity';

describe('DeleteTodoHandler', () => {
  let handler: DeleteTodoHandler;
  const mockTodosRepository = {
    save: jest.fn(),
    findByCriteria: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTodoHandler,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockTodosRepository,
        },
      ],
    }).compile();

    handler = module.get<DeleteTodoHandler>(DeleteTodoHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });
});
