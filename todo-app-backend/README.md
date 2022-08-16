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

1. install
   ```sh
   npm install --save @nestjs/swagger
   ```
2. configure

   ```ts
   main.ts:

    async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Ajusta la url: http://localhost/api
    app.setGlobalPrefix('api');

    // Ajustar transform a true hará que Nest intente transformar las entradas
    // con el tipado del Dto
    // whitelist en true eliminará propiedades que no están en los Dto
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        // whitelist: true,
        transformOptions: {
          // enableImplicitConversion: true,
        },
      }),
    );

    // Swagger. API Documentation
    const config = new DocumentBuilder()
      .setTitle('ToDo APP')
      .setDescription('Application to keep track of tasks to perfom')
      .setVersion('1.0')
      .addTag('todos')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(3000);
   }
   bootstrap();
   ```

3. create response model with api properties

   ```ts
   contexts/shared/models/api-response-body.ts:

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
      error: string;

      @ApiPropertyOptional()
      errors: string[];
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

    export class ApiMultipleResponseDto<T> {
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
   ```

4. create custom api response decorators

   ```ts
   contexts/shared/api-response-decorators.ts:

    export const ApiOkStringDataResponse = () =>
      applyDecorators(
        ApiExtraModels(ApiSingleResponseDto),
        ApiOkResponse({
          schema: {
            allOf: [
              { $ref: getSchemaPath(ApiSingleResponseDto) },
              {
                properties: {
                  data: {
                    type: 'string',
                  },
                },
              },
            ],
          },
        }),
      );

    export const ApiOkSingleDataResponse = <DataDto extends Type<unknown>>(
      dataDto: DataDto,
    ) =>
      applyDecorators(
        ApiExtraModels(ApiSingleResponseDto, dataDto),
        ApiOkResponse({
          schema: {
            allOf: [
              { $ref: getSchemaPath(ApiSingleResponseDto) },
              {
                properties: {
                  data: {
                    $ref: getSchemaPath(dataDto),
                  },
                },
              },
            ],
          },
        }),
      );

    export const ApiOkMultipleDataResponse = <DataDto extends Type<unknown>>(
      dataDto: DataDto,
    ) =>
      applyDecorators(
        ApiExtraModels(ApiMultipleResponseDto, dataDto),
        ApiOkResponse({
          schema: {
            allOf: [
              {
                $ref: getSchemaPath(ApiMultipleResponseDto),
              },
              {
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(dataDto) },
                  },
                },
              },
            ],
          },
        }),
      );

    export const ApiErrorDataResponse = () =>
      applyDecorators(
        ApiExtraModels(ApiSingleErrorResponseDto),
        ApiResponse({
          status: 210,
          schema: {
            allOf: [{ $ref: getSchemaPath(ApiSingleErrorResponseDto) }],
          },
        }),
      );
   ```

5. update create endpoint with swagger decorators and response model

   ```ts
   todos.controller.ts:

    @ApiTags('todos')
    @Controller('todos')
    export class TodosController {
      constructor(private readonly todosService: TodosService) {}

      @ApiOkStringDataResponse()
      @ApiErrorDataResponse()
      @Post()
      create(@Body() createTodoDto: CreateTodoDto): ApiSingleResponseDto<string> {
        console.log(createTodoDto);
        const todoId = this.todosService.create(createTodoDto);
        return {
          status: ApiResponseStatus.OK,
          message: 'La tarea se creo correctamente',
          data: todoId,
        };
      }

      @ApiOkMultipleDataResponse(Todo)
      @ApiErrorDataResponse()
      @Get()
      findAll(): ApiMultipleResponseDto<Todo> {
        const todos = this.todosService.findAll();
        return {
          status: ApiResponseStatus.OK,
          data: [],
        };
      }

      @ApiOkStringDataResponse()
      @ApiErrorDataResponse()
      @Get(':id')
      findOne(
        @Param('id', ParseUUIDPipe) id: string,
      ): ApiSingleResponseDto<string> {
        console.log(id);
        const todoId = this.todosService.findOne(+id);
        return {
          status: ApiResponseStatus.OK,
          data: todoId,
        };
      }

      @ApiOkStringDataResponse()
      @ApiErrorDataResponse()
      @Patch(':id')
      update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTodoDto: UpdateTodoDto,
      ): ApiSingleResponseDto<string> {
        updateTodoDto.id = id;
        console.log(updateTodoDto);
        const todoId = this.todosService.update(+id, updateTodoDto);
        return {
          status: ApiResponseStatus.OK,
          data: todoId,
        };
      }

      @ApiOkStringDataResponse()
      @ApiErrorDataResponse()
      @Delete(':id')
      remove(@Param('id', ParseUUIDPipe) id: string) {
        console.log(id);
        const todoId = this.todosService.remove(+id);
        return {
          status: ApiResponseStatus.OK,
          data: todoId,
        };
      }
   ```

6. add swagger stats
