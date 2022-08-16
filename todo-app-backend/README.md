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

6. add swagger stats and enableCors

   ```sh
     npm i swagger-stats
   ```

   ```ts
   main.ts:

    import * as swStats from 'swagger-stats';

    app.enableCors();

    app.use(swStats.getMiddleware({ uriPath: '/swagger-stats' }));
   ```

7. check metrics on:
   - http://localhost:3000/swagger-stats/ui
   - http://localhost:3000/swagger-stats/metrics
   - http://localhost:3000/swagger-stats/stats

## Terminus (Health Check)

1. install

   ```sh
      npm i @nestjs/terminus
      nest g module health
      nest g controller health
      npm i --save @nestjs/axios
   ```

2. module config

   ```ts
    health/health.module.ts:

    @Module({
      controllers: [HealthController],
      imports: [TerminusModule, HttpModule],
    })
    export class HealthModule {}
   ```

3. create health endpoint

   ```ts
    health/health.controller.ts:

    @Controller('health')
    export class HealthController {
      constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
      ) {}

      @Get()
      @HealthCheck()
      check() {
        return this.health.check([
          () => this.http.pingCheck('seyte', 'https://www.seyte.com/'),
        ]);
      }
    }
   ```

4. check: http://localhost:3000/health

## TypeORM

1. install
   ```sh
      npm install --save @nestjs/typeorm typeorm mysql2
      npm install sqlite3 --save
   ```
2. config

   ```ts
   app.module.ts:

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
   ```

   ```ts
   contexts/todos/todos.module.ts:

     imports: [TypeOrmModule.forFeature([Todo])],

   ```

3. todo entity model

   ```ts
    contexts/todos/entities/todo.entity.ts:

    @Entity()
    export class Todo {
      @ApiProperty()
      @PrimaryColumn({ type: 'uuid' })
      id: string;

      @ApiProperty()
      @Column({ type: 'varchar' })
      title: string;

      @ApiProperty()
      @Column({ type: 'text' })
      description: string;

      @ApiProperty()
      @Column({ type: 'boolean' })
      isCompleted: boolean;

      @ApiProperty()
      @Column({ type: 'int' })
      order: number;
    }
   ```

4. service with repository use

   ```ts
   contexts/todos/todos.service.ts:

    @Injectable()
    export class TodosService {
      constructor(
        @InjectRepository(Todo)
        private todoRepository: Repository<Todo>,
      ) {}

      async create(createTodoDto: CreateTodoDto): Promise<Todo> {
        const todo = new Todo();
        todo.id = randomUUID();
        todo.title = createTodoDto.title;
        todo.description = createTodoDto.description;
        todo.isCompleted = createTodoDto.isCompleted;
        todo.order = createTodoDto.order;
        return await this.todoRepository.save(todo);
      }

      async findAll(): Promise<Todo[]> {
        return await this.todoRepository.find();
      }

      async findOne(id: string): Promise<Todo> {
        return await this.todoRepository.findOne({ where: { id } });
      }

      async update(updateTodoDto: UpdateTodoDto): Promise<Todo> {
        const { id, ...data } = updateTodoDto;
        let todo = await this.findOne(id);
        todo = { ...todo, ...data };
        return await this.todoRepository.save(todo);
      }

      async remove(id: string): Promise<number> {
        const deleteResult = await this.todoRepository.delete({ id });
        return deleteResult.affected;
      }
    }
   ```

   ```ts
   contexts/todos/todos.controller.ts:

     @ApiTags('todos')
     @Controller('todos')
     export class TodosController {
       constructor(private readonly todosService: TodosService) {}

       @ApiOkStringDataResponse()
       @ApiErrorDataResponse()
       @Post()
       async create(
         @Body() createTodoDto: CreateTodoDto,
       ): Promise<ApiSingleResponseDto<string>> {
         console.log(createTodoDto);
         const todo = await this.todosService.create(createTodoDto);
         return {
           status: ApiResponseStatus.OK,
           message: 'La tarea se creo correctamente',
           data: todo.id,
         };
       }

       @ApiOkMultipleDataResponse(Todo)
       @ApiErrorDataResponse()
       @Get()
       async findAll(): Promise<ApiMultipleResponseDto<Todo>> {
         const todos = await this.todosService.findAll();
         return {
           status: ApiResponseStatus.OK,
           data: todos,
         };
       }

       @ApiOkStringDataResponse()
       @ApiErrorDataResponse()
       @Get(':id')
       async findOne(
         @Param('id', ParseUUIDPipe) id: string,
       ): Promise<ApiSingleResponseDto<Todo>> {
         console.log(id);
         const todo = await this.todosService.findOne(id);
         return {
           status: ApiResponseStatus.OK,
           data: todo,
         };
       }

       @ApiOkStringDataResponse()
       @ApiErrorDataResponse()
       @Patch(':id')
       async update(
         @Param('id', ParseUUIDPipe) id: string,
         @Body() updateTodoDto: UpdateTodoDto,
       ): Promise<ApiSingleResponseDto<string>> {
         updateTodoDto.id = id;
         console.log(updateTodoDto);
         const todo = await this.todosService.update(updateTodoDto);
         return {
           status: ApiResponseStatus.OK,
           data: todo.id,
         };
       }

       @ApiOkNumberDataResponse()
       @ApiErrorDataResponse()
       @Delete(':id')
       async remove(
         @Param('id', ParseUUIDPipe) id: string,
       ): Promise<ApiSingleResponseDto<number>> {
         console.log(id);
         return {
           status: ApiResponseStatus.OK,
           data: await this.todosService.remove(id),
         };
       }
     }
   ```
