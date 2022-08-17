import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from '../src/contexts/todos/domain/todo.entity';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ApiResponseStatus } from '../src/contexts/shared/infraestructure/rest/api-responses.dto';
import { AllExceptionsFilter } from '../src/contexts/shared/infraestructure/filters/all-exceptions.filter';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Todo>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
      controllers: [],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    app.useGlobalFilters(new AllExceptionsFilter());

    repository = moduleFixture.get(getRepositoryToken(Todo));

    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/todos').expect(200);
  });

  it('/ (POST) fails', async () => {
    const response = await request(app.getHttpServer()).post('/todos').send({});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', ApiResponseStatus.KO);
  });

  it('/ (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/todos').send({
      title: 'title',
      description: 'description',
      order: 1,
      isCompleted: true,
    });

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.status).toBe(201);
  });

  it('/ (PATCH)', async () => {
    const id = randomUUID();
    await repository.save({
      id,
      title: 'title',
      description: 'description',
      order: 1,
      isCompleted: true,
    });
    return request(app.getHttpServer())
      .patch('/todos/' + id)
      .send({})
      .expect(200);
  });

  it('/ (PATCH) fails', async () => {
    const response = await request(app.getHttpServer())
      .patch('/todos/UUID')
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', ApiResponseStatus.KO);
  });

  it('/ (DELETE)', async () => {
    const id = randomUUID();
    await repository.save({
      id,
      title: 'title',
      description: 'description',
      order: 1,
      isCompleted: true,
    });
    return request(app.getHttpServer())
      .delete('/todos/' + id)
      .expect(200)
      .expect({
        status: ApiResponseStatus.OK,
        data: 1,
      });
  });
});
