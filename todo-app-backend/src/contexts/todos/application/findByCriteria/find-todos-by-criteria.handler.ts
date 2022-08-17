import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTodosByCriteriaQuery } from './find-todos-by-criteria.query';
import { TypeormCriteriaTransformer } from '../../../shared/infraestructure/typeorm/typeorm-criteria-transformer';
import { Todo } from '../../domain/todo.entity';
import { FindAllResult } from '../../../shared/domain/find-all-result';

@QueryHandler(FindTodosByCriteriaQuery)
export class FindTodosByCriteriaHandler
  implements IQueryHandler<FindTodosByCriteriaQuery>
{
  constructor(private readonly transformer: TypeormCriteriaTransformer<Todo>) {}

  async execute(query: FindTodosByCriteriaQuery): Promise<FindAllResult<Todo>> {
    // const data = await criteriaToTypeormQueryBuilder<Todo>(
    //   query,
    //   this.todosRepository,
    //   'todos',
    // ).getMany();
    // const total = await criteriaToTypeormQueryBuilder<Todo>(
    //   query,
    //   this.todosRepository,
    //   'todos',
    // ).getCount();
    const data = await this.transformer.transform(Todo, query).getMany();
    const total = await this.transformer.transform(Todo, query).getCount();
    return { total, data };
  }
}
