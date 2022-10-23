import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TripsModule } from '../../src/trip/trip.module';
import { createTripDTO } from '../../src/trip/dto/createTrip.dto';

const mockCreateDynamoose = jest.fn()
const mockGetDynamoose = jest.fn()
const mockExecDynamoose = jest.fn()
const mockUpdateDynamoose = jest.fn()
const mockDeleteDynamoose = jest.fn()

jest.mock('dynamoose', () => {
  return {
    Schema: jest.fn(),
    model: jest.fn(() => ({
      create: mockCreateDynamoose,
      get: mockGetDynamoose,
      scan: jest.fn(() => ({
        exec: mockExecDynamoose
      })),
      update: mockUpdateDynamoose,
      delete: mockDeleteDynamoose
    }))
  };
});

describe('TripsController (e2e)', () => {
  let app: INestApplication;

  const mockedId = 'testid'

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TripsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST/', () => {
    it('create a new trip', () => {
      jest.mock('uuid', () => ({ v4: () => mockedId }));

      const tripDTO: createTripDTO = {
        Date: new Date().toDateString(),
        OriginCity: 'Ghotam',
        DestinationCity: 'Metropolis',
        People: ['Batman', 'Superman']
      }

      const trip = {
        Id: mockedId,
        ...tripDTO
      }

      mockCreateDynamoose.mockResolvedValue(trip)

      return request(app.getHttpServer())
        .post('/trips')
        .send(tripDTO)
        .set('Accept', 'application/json')
        .expect(201)
        .expect(trip)
    });

  })

  describe('GET/', () => {
    it('Get one trip', () => {
      const id = '4823478'

      return request(app.getHttpServer())
        .get(`/trips/${id}`)
        .expect(200)
        .then(_ => {
          expect(mockGetDynamoose.mock.calls.length).toBe(1)
          expect(mockGetDynamoose.mock.calls[0]).toEqual([{ "Id": id }])
        })
    })

    it('Get all trips', () => {
      return request(app.getHttpServer())
        .get(`/trips`)
        .expect(200)
        .then(_ => {
          expect(mockExecDynamoose.mock.calls.length).toBe(1)
          expect(mockExecDynamoose.mock.calls[0]).toEqual([])
        })
    })
  })

  describe('PUT/', () => {
    it('Add people in a trip', () => {
      const id = '4242'

      const trip = {
        Id: id,
        Date: new Date().toDateString(),
        OriginCity: 'moon',
        DestinationCity: 'earth',
        People: ['alien1', 'alien2']
      }

      mockGetDynamoose.mockResolvedValue(trip)

      const requestBody = { "People": ["alien3", "alien4"] }

      return request(app.getHttpServer())
        .put(`/trips/${id}`)
        .send(requestBody)
        .expect(200)
        .then(_ => {
          expect(mockGetDynamoose.mock.calls.length).toBe(1)
          expect(mockGetDynamoose.mock.calls[0]).toEqual([{ "Id": id }])
          expect(mockUpdateDynamoose.mock.calls.length).toBe(1)
          expect(mockUpdateDynamoose.mock.calls[0]).toEqual([{
            "Id": id,
            "People": [...trip.People, ...requestBody.People]
          }])
        })
    })
  })

  describe('REMOVE/', () => {
    it('remove a trip', () => {
      const id = '53458'

      return request(app.getHttpServer())
        .delete(`/trips/${id}`)
        .expect(200)
        .then(_ => {
          expect(mockDeleteDynamoose.mock.calls.length).toBe(1)
          expect(mockDeleteDynamoose.mock.calls[0]).toEqual([{ "Id": id }])
        })
    })
  })
});
