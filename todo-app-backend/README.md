# Todo App Backend

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
