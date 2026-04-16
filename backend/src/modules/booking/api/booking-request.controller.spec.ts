import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { BookingRequestController } from './booking-request.controller';
import { CreateBookingRequestUseCase } from '../application/create-booking-request.usecase';
import { GetBookingRequestUseCase } from '../application/get-booking-request.usecase';
import { GetBookingRequestsUseCase } from '../application/get-booking-requests.usecase';
import { UpdateBookingRequestUseCase } from '../application/update-booking-request.usecase';

describe('BookingRequestController', () => {
  let app: INestApplication;

  const createBookingRequestUseCase = { execute: jest.fn() };
  const getBookingRequestUseCase = { execute: jest.fn() };
  const getBookingRequestsUseCase = { execute: jest.fn() };
  const updateBookingRequestUseCase = { execute: jest.fn() };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BookingRequestController],
      providers: [
        { provide: CreateBookingRequestUseCase, useValue: createBookingRequestUseCase },
        { provide: GetBookingRequestUseCase, useValue: getBookingRequestUseCase },
        { provide: GetBookingRequestsUseCase, useValue: getBookingRequestsUseCase },
        { provide: UpdateBookingRequestUseCase, useValue: updateBookingRequestUseCase },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /booking-requests creates booking request', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+123456789',
      email: 'john@example.com',
      checkInDate: '2026-03-20',
      checkOutDate: '2026-03-23',
      fixPrice: 4200,
      roomTypeId: '5a6db0f9-2f19-45c1-9f1b-df3167777b6f',
      additionalWishes: 'Late check-in',
    };
    const responseBody = { id: 'booking-1', ...payload, status: 'pending' };
    createBookingRequestUseCase.execute.mockResolvedValue(responseBody);

    const response = await request(app.getHttpServer()).post('/booking-requests').send(payload).expect(201);

    expect(response.body).toEqual(responseBody);
    expect(createBookingRequestUseCase.execute).toHaveBeenCalledTimes(1);
    expect(createBookingRequestUseCase.execute).toHaveBeenCalledWith(payload);
  });

  it('POST /booking-requests returns 400 for invalid date format', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      patronymic: 'Junior',
      phoneNumber: '+123456789',
      email: 'john@example.com',
      checkInDate: '03-20-2026',
      checkOutDate: '2026-03-23',
      fixPrice: 4200,
      roomTypeId: '5a6db0f9-2f19-45c1-9f1b-df3167777b6f',
    };

    await request(app.getHttpServer()).post('/booking-requests').send(payload).expect(400);
    expect(createBookingRequestUseCase.execute).not.toHaveBeenCalled();
  });

  it('POST /booking-requests returns 400 when fixPrice is missing', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+123456789',
      email: 'john@example.com',
      checkInDate: '2026-03-20',
      checkOutDate: '2026-03-23',
      roomTypeId: '5a6db0f9-2f19-45c1-9f1b-df3167777b6f',
      additionalWishes: 'Late check-in',
    };

    await request(app.getHttpServer()).post('/booking-requests').send(payload).expect(400);
    expect(createBookingRequestUseCase.execute).not.toHaveBeenCalled();
  });

  it('GET /booking-requests returns list with transformed query params', async () => {
    const responseBody = [{ id: 'booking-1' }, { id: 'booking-2' }];
    getBookingRequestsUseCase.execute.mockResolvedValue(responseBody);

    const response = await request(app.getHttpServer())
      .get('/booking-requests')
      .query({
        mobileNumber: '555',
        roomTypeName: 'deluxe',
        search: 'john',
        checkInDateFrom: '2026-03-01',
        checkInDateTo: '2026-03-31',
        checkOutDateFrom: '2026-03-02',
        checkOutDateTo: '2026-04-01',
        page: '2',
        limit: '10',
      })
      .expect(200);

    expect(response.body).toEqual(responseBody);
    expect(getBookingRequestsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getBookingRequestsUseCase.execute).toHaveBeenCalledWith({
      mobileNumber: '555',
      roomTypeName: 'deluxe',
      search: 'john',
      checkInDateFrom: '2026-03-01',
      checkInDateTo: '2026-03-31',
      checkOutDateFrom: '2026-03-02',
      checkOutDateTo: '2026-04-01',
      page: 2,
      limit: 10,
    });
  });

  it('GET /booking-requests returns 400 for invalid page', async () => {
    await request(app.getHttpServer()).get('/booking-requests').query({ page: '0' }).expect(400);
    expect(getBookingRequestsUseCase.execute).not.toHaveBeenCalled();
  });

  it('GET /booking-requests/:id returns one booking request', async () => {
    const responseBody = { id: 'booking-1', firstName: 'John' };
    getBookingRequestUseCase.execute.mockResolvedValue(responseBody);

    const response = await request(app.getHttpServer()).get('/booking-requests/booking-1').expect(200);

    expect(response.body).toEqual(responseBody);
    expect(getBookingRequestUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getBookingRequestUseCase.execute).toHaveBeenCalledWith('booking-1');
  });

  it('GET /booking-requests/:id returns 404 when booking request is missing', async () => {
    getBookingRequestUseCase.execute.mockRejectedValue(
      new NotFoundException('Booking request with id missing-id not found'),
    );

    await request(app.getHttpServer()).get('/booking-requests/missing-id').expect(404);
  });

  it('PATCH /booking-requests/:id updates booking request', async () => {
    const payload = {
      phoneNumber: '+998877665',
      status: 'confirmed',
      checkInDate: '2026-03-22',
      checkOutDate: '2026-03-25',
    };
    const responseBody = { id: 'booking-1', ...payload };
    updateBookingRequestUseCase.execute.mockResolvedValue(responseBody);

    const response = await request(app.getHttpServer())
      .patch('/booking-requests/booking-1')
      .send(payload)
      .expect(200);

    expect(response.body).toEqual(responseBody);
    expect(updateBookingRequestUseCase.execute).toHaveBeenCalledTimes(1);
    expect(updateBookingRequestUseCase.execute).toHaveBeenCalledWith('booking-1', payload);
  });

  it('PATCH /booking-requests/:id returns 400 for invalid date format', async () => {
    await request(app.getHttpServer())
      .patch('/booking-requests/booking-1')
      .send({ checkInDate: '22-03-2026' })
      .expect(400);

    expect(updateBookingRequestUseCase.execute).not.toHaveBeenCalled();
  });
});
