import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  @Transform((param) => ['1', 'true'].includes(param.value))
  isCompleted: boolean;

  @ApiProperty()
  @IsNumber()
  @Transform((param) => Number(param.value))
  order: number;
}
