import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTodoDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  @Transform((param) => ['1', 'true'].includes(param.value))
  isCompleted: boolean;

  @IsNumber()
  @Transform((param) => Number(param.value))
  order: number;
}
