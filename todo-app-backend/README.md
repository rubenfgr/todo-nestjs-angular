# Todo App Backend

optional: configure IDE to use ESLint and Prettier on save

- [Todo App Backend](#todo-app-backend)
  - [Installation and configuration](#installation-and-configuration)
  - [Todo Entity CRUD](#todo-entity-crud)
  - [Todo Entity and Dtos with validation](#todo-entity-and-dtos-with-validation)
  - [Swagger (api documentation)](#swagger-api-documentation)
  - [Terminus (Health Check)](#terminus-health-check)
  - [TypeORM](#typeorm)
  - [Global exception filter](#global-exception-filter)
  - [Criteria/specification pattern](#criteriaspecification-pattern)
  - [Logs con winston](#logs-con-winston)

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

## Global exception filter

1. create exception filter

   ```ts
   contexts/shared/all-exceptions.filter.ts:

    @Catch()
    export class AllExceptionsFilter<T> implements ExceptionFilter {
      catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const responseBody: ApiSingleErrorResponseDto = {
          status: ApiResponseStatus.KO,
          message: 'Error interno en el servidor',
          data: {
            id: randomUUID(),
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: exception.message,
          },
        };

        if (exception instanceof HttpException && exception.getResponse()) {
          const exceptionResponse: any = exception.getResponse();
          console.log(exceptionResponse.message);
          if (Array.isArray(exceptionResponse.message)) {
            responseBody.data.errors = exceptionResponse.message;
            exceptionResponse.message = 'Datos inválidos';
          }
          responseBody.message = exceptionResponse.message;
          responseBody.data.statusCode = exceptionResponse.statusCode;
          responseBody.data.error = exceptionResponse.error;
        }

        return response.status(200).json(responseBody);
      }
    }
   ```

2. config in main.ts

   ```ts
   main.ts:

   app.useGlobalFilters(new AllExceptionsFilter());
   ```

3. test with postman

## Criteria/specification pattern

1. create criteria model and typeorm-criteria-transformer

   ```ts
   contexts/shared/models/criteria.ts:

    export class Criteria {
      @Transform((item) => {
        if (Array.isArray(item.value)) {
          return item.value.map((filter) => JSON.parse(filter));
        }
        return JSON.parse(item.value);
      })
      where?: Filter | Filter[];
      @Transform((item) => {
        if (Array.isArray(item.value)) {
          return item.value.map((filter) => JSON.parse(filter));
        }
        return JSON.parse(item.value);
      })
      orWhere?: Filter | Filter[];
      @Transform((item) => {
        if (Array.isArray(item.value)) {
          return item.value.map((order) => JSON.parse(order));
        }
        return JSON.parse(item.value);
      })
      order?: Order | Order[];
      @IsNumber()
      @IsOptional()
      @Transform((item) => Number(item.value))
      offset?: number;
      @IsNumber()
      @IsOptional()
      @Transform((item) => Number(item.value))
      limit?: number;
      include?: string | string[];
      select?: string | string[];
      @Transform((item) => JSON.parse(item.value))
      others?: { [key: string]: any };
    }

    export abstract class Filter {
      field: string;
      operator: FilterOperator;
      value: string;
    }

    export abstract class Order {
      orderBy: string;
      type: OrderType;
    }

    export enum FilterOperator {
      EQUAL = '=',
      NOT_EQUAL = '!=',
      GT = '>',
      GT_OR_EQUAL = '>=',
      LT = '<',
      LT_OR_EQUAL = '<=',
      CONTAINS = 'CONTAINS',
      NOT_CONTAINS = 'NOT_CONTAINS',
      START_WITH = 'START_WITH',
      END_WITH = 'END_WITH',
    }

    export type OrderType = 'ASC' | 'DESC';
   ```

   ```ts
   contexts/shared/typeorm-criteria-transformer.ts:

   export const criteriaArgToArray = (arg: any | any[] | undefined): any[] => {
     if (!arg) {
       return undefined;
     }
     if (Array.isArray(arg)) {
       return arg;
     }
     return [arg];
   };

   export const criteriaToTypeormQueryBuilder = <T>(
     criteria: Criteria,
     repository: Repository<any>,
     alias: string,
   ): SelectQueryBuilder<T> => {
     const queryBuilder = repository.createQueryBuilder(alias);

     FindOptionsUtils.joinEagerRelations(
       queryBuilder,
       queryBuilder.alias,
       repository.metadata,
     );

     if (criteria.include) {
       const relations = criteriaArgToArray(criteria.include);
       relations.forEach((relation) => {
         const relationSplit = relation.split('.');
         if (relationSplit.length === 1) {
           queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
         }
         if (relationSplit.length === 2) {
           queryBuilder.leftJoinAndSelect(relation, relationSplit[1]);
         }
       });
     }
     if (criteria.select) {
       const selects = criteriaArgToArray(criteria.select);
       selects.forEach((select) => {
         queryBuilder.select(select);
       });
     }
     if (criteria.order) {
       const orders: Order[] = criteriaArgToArray(criteria.order);
       orders.forEach((order) => {
         queryBuilder.orderBy(`${alias}.${order.orderBy}`, order.type);
       });
     }
     let isWherable = false;

     if (criteria.where) {
       const filters = criteriaArgToArray(criteria.where);
       filters.forEach((filter: Filter) => {
         const fields = filter.field.split('.');
         const field = fields[fields.length - 1];
         if (!isWherable) {
           isWherable = true;
           queryBuilder.where(getWhereByFilter(filter));
           // queryBuilder.where(getWhereByFilter(filter));
         } else {
           queryBuilder.andWhere(getWhereByFilter(filter));
         }
       });
     }
     if (criteria.orWhere) {
       const filters = criteriaArgToArray(criteria.orWhere);
       filters.forEach((filter: Filter) => {
         if (!isWherable) {
           isWherable = true;
           queryBuilder.where(getWhereByFilter(filter));
         } else {
           queryBuilder.orWhere(getWhereByFilter(filter));
         }
       });
     }
     if (criteria.offset) {
       queryBuilder.skip(criteria.offset);
     }

     if (criteria.limit) {
       queryBuilder.take(criteria.limit);
     }

     return queryBuilder;
   };

   export const getWhereByFilter = (filter: Filter) => {
     let where = {};
     const last = {};
     const fieldSplit = filter.field.split('.');
     if (filter.operator === FilterOperator.GT) {
       // where[filter.field] = MoreThan(filter.value ?? '');
       fieldSplit.forEach((field) => {
         where = where[field];
       });
       where = MoreThan(filter.value ?? '');
     }
     if (filter.operator === FilterOperator.GT_OR_EQUAL) {
       where[filter.field] = MoreThanOrEqual(filter.value ?? '');
     }
     if (filter.operator === FilterOperator.LT) {
       where[filter.field] = LessThan(filter.value ?? '');
     }
     if (filter.operator === FilterOperator.LT_OR_EQUAL) {
       where[filter.field] = LessThanOrEqual(filter.value ?? '');
     }
     if (filter.operator === FilterOperator.EQUAL) {
       if (fieldSplit.length === 1) {
         where[filter.field] = Equal(filter.value ?? '');
       }
       if (fieldSplit.length === 2) {
         where[fieldSplit[0]] = { [fieldSplit[1]]: Equal(filter.value ?? '') };
       }
       if (fieldSplit.length === 3) {
         where[fieldSplit[0]] = {
           [fieldSplit[1]]: { [fieldSplit[2]]: Equal(filter.value ?? '') },
         };
       }
     }
     if (filter.operator === FilterOperator.CONTAINS) {
       where[filter.field] = Like(`%${filter.value ?? ''}%`);
     }
     if (filter.operator === FilterOperator.NOT_CONTAINS) {
       where[filter.field] = Not(Like(`%${filter.value ?? ''}%`));
     }
     if (filter.operator === FilterOperator.NOT_EQUAL) {
       where[filter.field] = Not(Equal(filter.value ?? ''));
     }
     return where;
   };

   export const criteriaToTypeOrmManyOptions = (
     criteria: Criteria,
   ): FindManyOptions<any> => {
     const options: FindManyOptions<any> = {
       relations: criteriaArgToArray(criteria.include),
       select: criteriaArgToArray(criteria.select),
       order: criteriaOrderToTypeormOrder(criteriaArgToArray(criteria.order)),
       where: criteriaFilterToTypeormWhere(criteriaArgToArray(criteria.where)),
       withDeleted: false,
     };

     if (criteria.offset) {
       options.skip = criteria.offset;
     }

     if (criteria.limit) {
       options.take = criteria.offset + criteria.limit;
     }

     return options;
   };

   export const criteriaOrderToTypeormOrder = (
     criteriaOrder: Order[] | undefined,
   ): { [x: string]: 'ASC' | 'DESC' | 1 | -1 } => {
     if (!criteriaOrder) return;
     const typeormOrder = {};
     criteriaOrder.forEach((order: Order) => {
       if (order.type === 'ASC' || order.type === 'DESC') {
         typeormOrder[order.orderBy] = order.type.toUpperCase();
       }
     });
     return typeormOrder;
   };

   export const criteriaFilterToTypeormWhere = (
     criteriaFilter: Filter[] | undefined,
   ): FindOptionsWhere<any>[] => {
     if (!criteriaFilter) return;
     const typeormWhere: FindOptionsWhere<any>[] = [];
     criteriaFilter.forEach((filter: Filter) => {
       if (filter.operator === FilterOperator.GT) {
         typeormWhere[filter.field] = MoreThan(filter.value ?? '');
       }
       if (filter.operator === FilterOperator.GT_OR_EQUAL) {
         typeormWhere[filter.field] = MoreThanOrEqual(filter.value ?? '');
       }
       if (filter.operator === FilterOperator.LT) {
         typeormWhere[filter.field] = LessThan(filter.value ?? '');
       }
       if (filter.operator === FilterOperator.LT_OR_EQUAL) {
         typeormWhere[filter.field] = LessThanOrEqual(filter.value ?? '');
       }
       if (filter.operator === FilterOperator.EQUAL) {
         typeormWhere[filter.field] = Equal(filter.value ?? '');
       }
       if (filter.operator === FilterOperator.CONTAINS) {
         typeormWhere[filter.field] = Like(`%${filter.value ?? ''}%`);
       }
       if (filter.operator === FilterOperator.NOT_CONTAINS) {
         typeormWhere[filter.field] = Not(Like(`%${filter.value ?? ''}%`));
       }
       if (filter.operator === FilterOperator.NOT_EQUAL) {
         typeormWhere[filter.field] = Not(Equal(filter.value ?? ''));
       }
     });
     return typeormWhere;
   };
   ```

2. implement on service and controller in findAll endpoint

   ```ts
   contexts/todos/todos.service.ts:

       async findAll(criteria: Criteria): Promise<{ total: number; data: Todo[] }> {
     const data = await criteriaToTypeormQueryBuilder<Todo>(
       criteria,
       this.todoRepository,
       'todos',
     ).getMany();
     const total = await criteriaToTypeormQueryBuilder<Todo>(
       criteria,
       this.todoRepository,
       'todos',
     ).getCount();
     return { total, data };
   }
   ```

   ```ts
   contexts/todos/todos.controller.ts:

     @ApiOkMultipleDataResponse(Todo)
     @ApiErrorDataResponse()
     @Get()
     async findAll(@Query() criteria: Criteria): Promise<ApiResponsesDto<Todo>> {
       console.log(criteria);
       const { data, total } = await this.todosService.findAll(criteria);
       return {
         status: ApiResponseStatus.OK,
         data,
         total,
       };
     }
   ```

3. test with postman

## Logs con winston

1. install

   ```sh
     npm i --save winston
     npm i --save winston-daily-rotate-file
     npm i --save @elastic/ecs-winston-format
   ```

2. create custom loggin

   ```ts
    contexts/shared/loggin/winston-console.formater.ts:

    export const formatWinstonConsole = (): winston.Logform.Format => {
      return winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.ms(),
        winston.format.printf((info) => getFormatedMessageConsole(info)),
      );
    };

    const getFormatedMessageConsole = (info: any) => {
      const {
        timestamp,
        level,
        message,
        'log.origin.file.name': logOriginFileName,
        ms,
        err,
        ...args
      } = info;

      if (err) {
        delete err.response;
      }
      return (
        clc.cyanBright('[' + timestamp + '] ') +
        level +
        clc.yellow(' [' + logOriginFileName + '] ') +
        message +
        ' ' +
        (err ? JSON.stringify(err) : '') +
        (args ? JSON.stringify(args) : '') +
        clc.yellow(' ' + ms)
      );
    };
   ```

   ```ts
    contexts/shared/logging/logger-base.ts:

    export abstract class LoggerBase {
      protected logger: winston.Logger;
      protected originFileName: string;

      protected abstract createWinstonLogger(): winston.Logger;

      /**
      * Level 0
      */
      error(id: string, message: string, err: any): void {
        this.logger.error(
          LoggerBase.addDataToMessage(message, { id }),
          LoggerBase.formatEcsData(this.originFileName, err),
        );
      }

      /**
      * Level 1
      */
      warn(message: string, data: any): void {
        this.logger.warn(
          LoggerBase.addDataToMessage(message, data),
          LoggerBase.formatEcsData(this.originFileName),
        );
      }

      /**
      * Level 2
      */
      info(message: string, data: any): void {
        this.logger.info(
          LoggerBase.addDataToMessage(message, data),
          LoggerBase.formatEcsData(this.originFileName),
        );
      }

      /**
      * Level 3
      */
      http(message: string, data: any): void {
        this.logger.http(
          LoggerBase.addDataToMessage(message, data),
          LoggerBase.formatEcsData(this.originFileName),
        );
      }

      /**
      * Level 4
      */
      verbose(message: string, data: any): void {
        this.logger.verbose(
          LoggerBase.addDataToMessage(message, data),
          LoggerBase.formatEcsData(this.originFileName),
        );
      }

      /**
      * Level 5
      */
      debug(message: string, data: any): void {
        this.logger.debug(
          LoggerBase.addDataToMessage(message, data),
          LoggerBase.formatEcsData(this.originFileName),
        );
      }

      /**
      * Level 6
      */
      silly(message: string, data: any): void {
        this.logger.silly(
          LoggerBase.addDataToMessage(message, data),
          LoggerBase.formatEcsData(this.originFileName),
        );
      }

      private static addDataToMessage(message: string, data?: any) {
        console.log(data);
        if (data) {
          return `${message} ${JSON.stringify(data)}`;
        }
        return message;
      }

      /**
      * ECS Field Reference
      * https://www.elastic.co/guide/en/ecs/8.1/ecs-field-reference.html
      *
      * Fields Selected:
      * {
      *     "@timestamp": "2020-04-01T12:00:00.000Z", // default base ECS
      *     "message": "message", // default base ECS, added metadata at the end
      *     "log.level": "error", // default base ECS
      *     "log.origin.file.name": // added
      *     "log.logger": // added
      *     "agent.name": "app-logs-nest-example", // default base ECS, prefix_pattern in docker-compose.yml or .env
      *
      *     To add errors:
      *     "err": // optional, ECS autoconverted from Error or Exception
      * }
      *
      */
      private static formatEcsData(originFileName: string, err?: any) {
        const dataFormated = {
          'log.origin.file.name': originFileName,
        };

        if (err) {
          dataFormated['err'] = err;
        }

        return dataFormated;
      }
    }
   ```

   ```ts
   contexts/shared/loggin/logger-app.ts:

    export class LoggerApp extends LoggerBase {
      constructor(originFileName: string) {
        super();
        super.originFileName = originFileName;
        super.logger = this.createWinstonLogger();
      }

      protected createWinstonLogger() {
        return winston.createLogger({
          defaultMeta: { 'log.logger': 'appLogger' },
          format: ecsFormat(),
          transports: [
            new winston.transports.DailyRotateFile({
              level: 'silly',
              dirname: 'logs/app',
              filename: 'app-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
            }),
            new winston.transports.Console({
              level: 'silly',
              format: formatWinstonConsole(),
            }),
          ],
        });
      }
    }
   ```

3. add logging to global exception filter

   ```ts
   contexts/shared/exceptions/all-exception.filter.ts:

   this.loggerApp.error(id, exception.message, exception);
   ```
