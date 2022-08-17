import { IsUUID } from 'class-validator';

export class CommandQueryUuid {
  @IsUUID()
  id: string;
}
