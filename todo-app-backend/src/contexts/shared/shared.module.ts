import { Module } from '@nestjs/common';
import { TypeormCriteriaTransformer } from './infraestructure/typeorm/typeorm-criteria-transformer';

@Module({
  providers: [TypeormCriteriaTransformer],
  exports: [TypeormCriteriaTransformer],
})
export class SharedModule {}
