import { ApiProperty } from '@nestjs/swagger';

export class Todo {
  @ApiProperty()
  id: string;

  title: string;

  description: string;

  isCompleted: boolean;

  order: number;
}
