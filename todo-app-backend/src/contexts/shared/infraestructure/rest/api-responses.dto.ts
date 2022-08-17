import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ApiResponseStatus {
  OK = 'OK',
  KO = 'KO',
}

export class ApiErrorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  errors?: string[];
}

export class ApiSingleErrorResponseDto {
  @ApiProperty({ enum: ApiResponseStatus, default: ApiResponseStatus.KO })
  status: ApiResponseStatus;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: ApiErrorResponseDto;
}

export class ApiSingleResponseDto<T> {
  @ApiProperty({ enum: ApiResponseStatus })
  status: ApiResponseStatus;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  data?: T;
}

export class ApiResponsesDto<T> {
  @ApiProperty({ enum: ApiResponseStatus })
  status: ApiResponseStatus;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  total?: number;

  @ApiPropertyOptional()
  data?: T[];

  @ApiPropertyOptional()
  offset?: T;

  @ApiPropertyOptional()
  limit?: T;
}
