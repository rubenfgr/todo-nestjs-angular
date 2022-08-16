import {
  Equal,
  FindManyOptions,
  FindOptionsUtils,
  FindOptionsWhere,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Criteria, Filter, FilterOperator, Order } from './criteria';

export const criteriaArgToArray = (arg: any | any[] | undefined): any[] => {
  if (!arg) {
    return undefined;
  }
  if (Array.isArray(arg)) {
    return arg;
  }
  return [arg];
};

export const criteriaToTypeormQueryBuilder = <T>(
  criteria: Criteria,
  repository: Repository<any>,
  alias: string,
): SelectQueryBuilder<T> => {
  const queryBuilder = repository.createQueryBuilder(alias);

  FindOptionsUtils.joinEagerRelations(
    queryBuilder,
    queryBuilder.alias,
    repository.metadata,
  );

  if (criteria.include) {
    const relations = criteriaArgToArray(criteria.include);
    relations.forEach((relation) => {
      const relationSplit = relation.split('.');
      if (relationSplit.length === 1) {
        queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
      }
      if (relationSplit.length === 2) {
        queryBuilder.leftJoinAndSelect(relation, relationSplit[1]);
      }
    });
  }
  if (criteria.select) {
    const selects = criteriaArgToArray(criteria.select);
    selects.forEach((select) => {
      queryBuilder.select(select);
    });
  }
  if (criteria.order) {
    const orders: Order[] = criteriaArgToArray(criteria.order);
    orders.forEach((order) => {
      queryBuilder.orderBy(`${alias}.${order.orderBy}`, order.type);
    });
  }
  let isWherable = false;

  if (criteria.where) {
    const filters = criteriaArgToArray(criteria.where);
    filters.forEach((filter: Filter) => {
      const fields = filter.field.split('.');
      const field = fields[fields.length - 1];
      if (!isWherable) {
        isWherable = true;
        queryBuilder.where(getWhereByFilter(filter));
        // queryBuilder.where(getWhereByFilter(filter));
      } else {
        queryBuilder.andWhere(getWhereByFilter(filter));
      }
    });
  }
  if (criteria.orWhere) {
    const filters = criteriaArgToArray(criteria.orWhere);
    filters.forEach((filter: Filter) => {
      if (!isWherable) {
        isWherable = true;
        queryBuilder.where(getWhereByFilter(filter));
      } else {
        queryBuilder.orWhere(getWhereByFilter(filter));
      }
    });
  }
  if (criteria.offset) {
    queryBuilder.skip(criteria.offset);
  }

  if (criteria.limit) {
    queryBuilder.take(criteria.limit);
  }

  return queryBuilder;
};

export const getWhereByFilter = (filter: Filter) => {
  let where = {};
  const last = {};
  const fieldSplit = filter.field.split('.');
  if (filter.operator === FilterOperator.GT) {
    // where[filter.field] = MoreThan(filter.value ?? '');
    fieldSplit.forEach((field) => {
      where = where[field];
    });
    where = MoreThan(filter.value ?? '');
  }
  if (filter.operator === FilterOperator.GT_OR_EQUAL) {
    where[filter.field] = MoreThanOrEqual(filter.value ?? '');
  }
  if (filter.operator === FilterOperator.LT) {
    where[filter.field] = LessThan(filter.value ?? '');
  }
  if (filter.operator === FilterOperator.LT_OR_EQUAL) {
    where[filter.field] = LessThanOrEqual(filter.value ?? '');
  }
  if (filter.operator === FilterOperator.EQUAL) {
    if (fieldSplit.length === 1) {
      where[filter.field] = Equal(filter.value ?? '');
    }
    if (fieldSplit.length === 2) {
      where[fieldSplit[0]] = { [fieldSplit[1]]: Equal(filter.value ?? '') };
    }
    if (fieldSplit.length === 3) {
      where[fieldSplit[0]] = {
        [fieldSplit[1]]: { [fieldSplit[2]]: Equal(filter.value ?? '') },
      };
    }
  }
  if (filter.operator === FilterOperator.CONTAINS) {
    where[filter.field] = Like(`%${filter.value ?? ''}%`);
  }
  if (filter.operator === FilterOperator.NOT_CONTAINS) {
    where[filter.field] = Not(Like(`%${filter.value ?? ''}%`));
  }
  if (filter.operator === FilterOperator.NOT_EQUAL) {
    where[filter.field] = Not(Equal(filter.value ?? ''));
  }
  return where;
};

export const criteriaToTypeOrmManyOptions = (
  criteria: Criteria,
): FindManyOptions<any> => {
  const options: FindManyOptions<any> = {
    relations: criteriaArgToArray(criteria.include),
    select: criteriaArgToArray(criteria.select),
    order: criteriaOrderToTypeormOrder(criteriaArgToArray(criteria.order)),
    where: criteriaFilterToTypeormWhere(criteriaArgToArray(criteria.where)),
    withDeleted: false,
  };

  if (criteria.offset) {
    options.skip = criteria.offset;
  }

  if (criteria.limit) {
    options.take = criteria.offset + criteria.limit;
  }

  return options;
};

export const criteriaOrderToTypeormOrder = (
  criteriaOrder: Order[] | undefined,
): { [x: string]: 'ASC' | 'DESC' | 1 | -1 } => {
  if (!criteriaOrder) return;
  const typeormOrder = {};
  criteriaOrder.forEach((order: Order) => {
    if (order.type === 'ASC' || order.type === 'DESC') {
      typeormOrder[order.orderBy] = order.type.toUpperCase();
    }
  });
  return typeormOrder;
};

export const criteriaFilterToTypeormWhere = (
  criteriaFilter: Filter[] | undefined,
): FindOptionsWhere<any>[] => {
  if (!criteriaFilter) return;
  const typeormWhere: FindOptionsWhere<any>[] = [];
  criteriaFilter.forEach((filter: Filter) => {
    if (filter.operator === FilterOperator.GT) {
      typeormWhere[filter.field] = MoreThan(filter.value ?? '');
    }
    if (filter.operator === FilterOperator.GT_OR_EQUAL) {
      typeormWhere[filter.field] = MoreThanOrEqual(filter.value ?? '');
    }
    if (filter.operator === FilterOperator.LT) {
      typeormWhere[filter.field] = LessThan(filter.value ?? '');
    }
    if (filter.operator === FilterOperator.LT_OR_EQUAL) {
      typeormWhere[filter.field] = LessThanOrEqual(filter.value ?? '');
    }
    if (filter.operator === FilterOperator.EQUAL) {
      typeormWhere[filter.field] = Equal(filter.value ?? '');
    }
    if (filter.operator === FilterOperator.CONTAINS) {
      typeormWhere[filter.field] = Like(`%${filter.value ?? ''}%`);
    }
    if (filter.operator === FilterOperator.NOT_CONTAINS) {
      typeormWhere[filter.field] = Not(Like(`%${filter.value ?? ''}%`));
    }
    if (filter.operator === FilterOperator.NOT_EQUAL) {
      typeormWhere[filter.field] = Not(Equal(filter.value ?? ''));
    }
  });
  return typeormWhere;
};
