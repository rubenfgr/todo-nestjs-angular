import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';

export class TodoRepositoryMock {
  public save(): void {}
}

describe('TodosService', () => {
  let service: TodosService;
  let repository: Repository<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useClass: TodoRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get(getRepositoryToken(Todo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
