import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTodosByCriteriaQuery } from './find-todos-by-criteria.query';
import { TypeormCriteriaTransformer } from '../../../shared/infraestructure/typeorm/typeorm-criteria-transformer';
import { Todo } from '../../domain/todo.entity';
import { FindAllResult } from '../../../shared/domain/find-all-result';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@QueryHandler(FindTodosByCriteriaQuery)
export class FindTodosByCriteriaHandler
  implements IQueryHandler<FindTodosByCriteriaQuery>
{
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  async execute(query: FindTodosByCriteriaQuery): Promise<FindAllResult<Todo>> {
    const transformer = new TypeormCriteriaTransformer<Todo>();
    const data = await transformer
      .transform(this.todoRepository, query)
      .getMany();
    const total = await transformer
      .transform(this.todoRepository, query)
      .getCount();
    return { total, data };
  }
}
