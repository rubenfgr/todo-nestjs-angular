import { Test, TestingModule } from '@nestjs/testing';
import { CreateTodoHandler } from './create-todo.handler';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from '../../domain/todo.entity';
import { CreateTodoCommand } from './create-todo.command';
import { validateSync } from 'class-validator';

describe('CreateTodoHandler', () => {
  let handler: CreateTodoHandler;
  const mockTodosRepository = {
    save: jest.fn(),
  };

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

  it('validate command fails', () => {
    const createTodoCommand = new CreateTodoCommand();
    const errors = validateSync(createTodoCommand);
    expect(errors.length).toEqual(4);
  });

  it('validate command ok', () => {
    const createTodoCommand = new CreateTodoCommand();
    createTodoCommand.title = 'title';
    createTodoCommand.description = 'description';
    createTodoCommand.isCompleted = false;
    createTodoCommand.order = 1;
    const errors = validateSync(createTodoCommand);
    expect(errors.length).toEqual(0);
  });

  it('should be created', async () => {
    const createTodoCommand = new CreateTodoCommand();
    createTodoCommand.title = 'title';
    createTodoCommand.description = 'description';
    createTodoCommand.isCompleted = false;
    createTodoCommand.order = 1;

    jest
      .spyOn(mockTodosRepository, 'save')
      .mockImplementation(() => ({ ...createTodoCommand, id: 'UUID' }));

    const result = await handler.execute(createTodoCommand);
    expect(result).toHaveProperty('id');
    expect(result).toMatchObject(createTodoCommand);
  });
});
