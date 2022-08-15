# Todo App Backend

optional: configure IDE to use ESLint and Prettier on save

## Installation and configuration

1. npm i -g @nestjs/cli
2. nest new todo-app-backend
3. cd todo-app-backend
4. npm run start:dev
5. set global prefix

   ```ts
   main.ts:

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);

     app.setGlobalPrefix('api');

     await app.listen(3000);
   }
   bootstrap();
   ```

6. test with postman

## Todo Entity CRUD

1. show nest cli options
   ```sh
   nest
   ```
2. create todo CRUD

   ```
   nest g resource contexts/todos
   > REST API
   > CRUD entry points ? Y
   ```

3. Test with postman

## Todo Entity and Dtos with validation

1. required installations
   ```sh
   npm i --save class-validator class-transformer
   ```
2. configure class-validator

   ```ts
   main.ts:

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);

     app.setGlobalPrefix('api');

     app.useGlobalPipes(
       new ValidationPipe({
         transform: true,
       }),
     );

     await app.listen(3000);
   }
   bootstrap();
   ```

3. add ParseUUIDPipe to findOne and Test with postman to show results

   ```ts
    todos.controller.ts

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.todosService.findOne(+id);
   }
   ```

4. add CreateTodoDto validations and test with postman

   ```ts
   create-todo.dto.ts:

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
   ```

5. add UpdateTodoDto validations and test with postman
   ¿porque agregar el id sin validación? Para lanzar command handlers con CQRS, lo vemos mas adelante.

   ```ts
   update-todo.dto.ts:

   export class UpdateTodoDto extends PartialType(CreateTodoDto) {
      id: string;
    }
   ```

6. add ParseUUIDPipe to delete endpoint

## Swagger (api documentation)
