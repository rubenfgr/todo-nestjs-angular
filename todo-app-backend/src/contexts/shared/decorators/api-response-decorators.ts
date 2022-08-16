import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiMultipleResponseDto,
  ApiSingleErrorResponseDto,
  ApiSingleResponseDto,
} from '../models/api-multiple-response.dto';

export const ApiOkStringDataResponse = () =>
  applyDecorators(
    ApiExtraModels(ApiSingleResponseDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSingleResponseDto) },
          {
            properties: {
              data: {
                type: 'string',
              },
            },
          },
        ],
      },
    }),
  );

export const ApiOkNumberDataResponse = () =>
  applyDecorators(
    ApiExtraModels(ApiSingleResponseDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSingleResponseDto) },
          {
            properties: {
              data: {
                type: 'number',
              },
            },
          },
        ],
      },
    }),
  );

export const ApiOkSingleDataResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ApiSingleResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSingleResponseDto) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
            },
          },
        ],
      },
    }),
  );

export const ApiOkMultipleDataResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ApiMultipleResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(ApiMultipleResponseDto),
          },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );

export const ApiErrorDataResponse = () =>
  applyDecorators(
    ApiExtraModels(ApiSingleErrorResponseDto),
    ApiResponse({
      status: 210,
      schema: {
        allOf: [{ $ref: getSchemaPath(ApiSingleErrorResponseDto) }],
      },
    }),
  );
