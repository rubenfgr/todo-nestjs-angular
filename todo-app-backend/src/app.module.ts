import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
    TodosModule,
    HealthModule,
    TypeOrmModule.forRoot({
      ...sqliteOptions,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
