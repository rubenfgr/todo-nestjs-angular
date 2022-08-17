import {
  Equal,
  FindOptionsUtils,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Criteria, Filter, FilterOperator, Order } from '../../domain/criteria';

export class TypeormCriteriaTransformer<T> {
  private repository: Repository<T>;
  private alias: string;

  transform = (
    repository: Repository<T>,
    criteria: Criteria,
  ): SelectQueryBuilder<T> => {
    this.repository = repository;

    this.alias = this.repository.metadata.tableName;

    const queryBuilder = this.repository.createQueryBuilder(this.alias);

    FindOptionsUtils.joinEagerRelations(
      queryBuilder,
      queryBuilder.alias,
      this.repository.metadata,
    );

    if (criteria.include) {
      const relations = this.criteriaArgToArray(criteria.include);
      relations.forEach((relation) => {
        const relationSplit = relation.split('.');
        if (relationSplit.length === 1) {
          queryBuilder.leftJoinAndSelect(`${this.alias}.${relation}`, relation);
        }
        if (relationSplit.length === 2) {
          queryBuilder.leftJoinAndSelect(relation, relationSplit[1]);
        }
      });
    }
    if (criteria.select) {
      const selects = this.criteriaArgToArray(criteria.select);
      selects.forEach((select) => {
        queryBuilder.select(select);
      });
    }
    if (criteria.order) {
      const orders: Order[] = this.criteriaArgToArray(criteria.order);
      orders.forEach((order) => {
        queryBuilder.orderBy(`${this.alias}.${order.orderBy}`, order.type);
      });
    }
    let isWherable = false;

    if (criteria.where) {
      const filters = this.criteriaArgToArray(criteria.where);
      filters.forEach((filter: Filter) => {
        const fields = filter.field.split('.');
        const field = fields[fields.length - 1];
        if (!isWherable) {
          isWherable = true;
          queryBuilder.where(this.getWhereByFilter(filter));
          // queryBuilder.where(getWhereByFilter(filter));
        } else {
          queryBuilder.andWhere(this.getWhereByFilter(filter));
        }
      });
    }
    if (criteria.orWhere) {
      const filters = this.criteriaArgToArray(criteria.orWhere);
      filters.forEach((filter: Filter) => {
        if (!isWherable) {
          isWherable = true;
          queryBuilder.where(this.getWhereByFilter(filter));
        } else {
          queryBuilder.orWhere(this.getWhereByFilter(filter));
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

  private criteriaArgToArray = (arg: any | any[] | undefined): any[] => {
    if (!arg) {
      return undefined;
    }
    if (Array.isArray(arg)) {
      return arg;
    }
    return [arg];
  };

  private getWhereByFilter = (filter: Filter) => {
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
}
