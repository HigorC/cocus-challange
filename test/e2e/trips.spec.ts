import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TripsModule } from '../../src/trip/trip.module';
import { createTripDTO } from '../../src/trip/dto/createTrip.dto';

const mockCreateDynamoose = jest.fn()

jest.mock('dynamoose', () => {
  return {
    Schema: jest.fn(),
    model: jest.fn(() => ({
      create: mockCreateDynamoose
    }))
  };
});

describe('TripsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TripsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST', () => {
    it('create a new trip', () => {
      const mockedId = 'testid'
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
});
