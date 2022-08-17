import { Module } from '@nestjs/common';
import { TodosModule } from './contexts/todos/todos.module';
import { HealthModule } from './health/health.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

export const sqliteOptions: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database/todos.db',
};

export const mysqlOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'todos',
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...sqliteOptions,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TodosModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
