/***********************************************************************************************************************
 *  SPECIFICATION|CRITERIA PATTERN
 **********************************************************************************************************************/
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class Criteria {
  @Transform((item) => {
    if (Array.isArray(item.value)) {
      return item.value.map((filter) => JSON.parse(filter));
    }
    return JSON.parse(item.value);
  })
  where?: Filter | Filter[];
  @Transform((item) => {
    if (Array.isArray(item.value)) {
      return item.value.map((filter) => JSON.parse(filter));
    }
    return JSON.parse(item.value);
  })
  orWhere?: Filter | Filter[];
  @Transform((item) => {
    if (Array.isArray(item.value)) {
      return item.value.map((order) => JSON.parse(order));
    }
    return JSON.parse(item.value);
  })
  order?: Order | Order[];
  @IsNumber()
  @IsOptional()
  @Transform((item) => Number(item.value))
  offset?: number;
  @IsNumber()
  @IsOptional()
  @Transform((item) => Number(item.value))
  limit?: number;
  include?: string | string[];
  select?: string | string[];
  @Transform((item) => JSON.parse(item.value))
  others?: { [key: string]: any };
}

export abstract class Filter {
  field: string;
  operator: FilterOperator;
  value: string;
}

export abstract class Order {
  orderBy: string;
  type: OrderType;
}

export enum FilterOperator {
  EQUAL = '=',
  NOT_EQUAL = '!=',
  GT = '>',
  GT_OR_EQUAL = '>=',
  LT = '<',
  LT_OR_EQUAL = '<=',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  START_WITH = 'START_WITH',
  END_WITH = 'END_WITH',
}

export type OrderType = 'ASC' | 'DESC';
