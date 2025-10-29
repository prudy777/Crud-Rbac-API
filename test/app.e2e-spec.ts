// test/app.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test as NestTest, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/core/services/prisma.service';

describe('Superb API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: request.SuperTest<request.Test>;

  // ---- helpers ----
  const truncateAll = async () => {
    await prisma.$executeRawUnsafe(`TRUNCATE "Post" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE "User" RESTART IDENTITY CASCADE;`);
  };

  const register = (
    overrides?: Partial<{ email: string; name: string; password: string }>
  ): request.Test => {
    const body = {
      email: 'newuser@e2e.test',
      name: 'New User',
      password: '12345678',
      ...overrides,
    };
    return http.post('/users/register').send(body);
  };

  const login = (email = 'newuser@e2e.test', password = '12345678'): request.Test =>
    http.post('/users/login').send({ email, password });

  const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleRef: TestingModule = await NestTest.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // mirror main.ts global pipes if you use them
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
      }),
    );

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
    await truncateAll();

    // assign to outer `http` (do NOT redeclare)
    http = request(app.getHttpServer() as any) as unknown as request.SuperTest<request.Test>;
  }, 30000);

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  }, 30000);

  // ---------- Smoke ----------
 it('GET / should return Hello World!', async () => {
  await http.get('/').expect(200).expect('Hello World!');
});

  // ---------- Users ----------
 describe('Users', () => {
    it('POST /users/register should create a user', async () => {
      const res = await register().expect(201);
      expect(res.body).toEqual({
        id: expect.any(Number),
        email: 'newuser@e2e.test',
        name: 'New User',
      });
    });

    it('POST /users/login should return access token', async () => {
      const res = await login().expect(201);
      expect(res.body).toEqual({ access_token: expect.any(String) });
    });

    it('POST /users/login should 404 for wrong email', async () => {
      const res = await http
        .post('/users/login')
        .send({ email: 'wrong@user.com', password: '12345678' })
        .expect(404);

      expect(res.body.message).toBe('User not found');
      // Nest HttpException uses "statusCode" by default
      expect(res.body.statusCode).toBe(404);
    });

    it('GET /users/me should return current user (auth required)', async () => {
      const { body } = await login().expect(201);
      const token = body.access_token as string;

      const me = await http.get('/users/me').set(authHeader(token)).expect(200);
      expect(me.body).toMatchObject({
        sub: expect.any(Number),
        email: 'newuser@e2e.test',
        name: 'New User',
      });
    });
  });

  // ---------- Posts ----------
   describe('Posts', () => {
    let token: string;
    let postId: number;

    beforeAll(async () => {
      await register({ email: 'author@e2e.test' }).expect(201);
      const res = await login('author@e2e.test', '12345678').expect(201);
      token = res.body.access_token;
    });

   it('POST /posts should create a post (auth)', async () => {
  const res = await http
    .post('/posts')
    .set(authHeader(token))
    .send({ title: 'First Post', content: 'Hello E2E!' })
    .expect(201);

  // Allow extra fields like authorId/published
  expect(res.body).toMatchObject({
    id: expect.any(Number),
    title: 'First Post',
    content: 'Hello E2E!',
  });

  postId = res.body.id; // this will run now that the assertion passes
});

it('GET /posts should paginate', async () => {
  const res = await http.get('/posts?page=1&size=10').expect(200);

  // Be permissive on meta to allow nextPage = null or number
  expect(res.body.data).toEqual(expect.any(Array));
  expect(res.body.meta).toMatchObject({
    total: expect.any(Number),
    lastPage: expect.any(Number),
    currentPage: 1,
    totalPerPage: 10,
    prevPage: null,
  });
  // optional: if you want to assert nextPage specifically
  // expect(res.body.meta.nextPage === null || typeof res.body.meta.nextPage === 'number').toBe(true);

  expect(res.body.data[0]).toMatchObject({
    id: postId,
    title: 'First Post',
  });
});
    it('GET /posts/:id should return the post', async () => {
      const res = await http.get(`/posts/${postId}`).expect(200);
      expect(res.body).toMatchObject({ id: postId, title: 'First Post' });
    });

    it('PATCH /posts/:id should update the post (auth)', async () => {
      const res = await http
        .patch(`/posts/${postId}`)
        .set(authHeader(token))
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body).toMatchObject({ id: postId, title: 'Updated Title' });
    });

    it('DELETE /posts/:id should delete (auth)', async () => {
      await http.delete(`/posts/${postId}`).set(authHeader(token)).expect(200);
      await http.get(`/posts/${postId}`).expect(404);
    });
  });
});
