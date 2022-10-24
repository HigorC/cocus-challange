import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UserModule } from '../../src/user/user.module';
import { AuthModule } from '../../src/auth/auth.module';
import { createUserDTO } from '../../src/user/dto/createUser.dto';
import { createTripDTO } from '../../src/user/dto/createTrip.dto';

const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjY2NDc4NjB9.axDvPk0YVFU6TzSVxHankIc5VS60845Mnwa5OHEqnR0"
const mockedId = 'testid'
const mockedUser = {
  Username: "mocked-username",
  Trips: [
    {
      TripID: 'fake1',
      Date: new Date().toDateString(),
      OriginCity: 'city a',
      DestinationCity: 'city b',
      People: ['p1', 'p2']
    },
    {
      TripID: 'fake2',
      Date: new Date().toDateString(),
      OriginCity: 'city c',
      DestinationCity: 'city d',
      People: ['p3', 'p4']
    }
  ]
}

jest.mock('uuid', () => ({ v4: () => mockedId }));

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

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Users', () => {
    describe('POST /users', () => {
      it('create a new user', () => {
        const userDTO: createUserDTO = {
          Username: "batman",
          Password: "iloveclows"
        }

        mockCreateDynamoose.mockResolvedValue({ Username: userDTO.Username })

        return request(app.getHttpServer())
          .post('/users')
          .send(userDTO)
          .set('Accept', 'application/json')
          .expect(201)
          .expect(`User ${userDTO.Username} created successufuly`)
      });

      it('returns a exception when user isnt returned', () => {
        jest.mock('uuid', () => ({ v4: () => mockedId }));

        const userDTO: createUserDTO = {
          Username: "batman",
          Password: "iloveclows"
        }

        return request(app.getHttpServer())
          .post('/users')
          .send(userDTO)
          .set('Accept', 'application/json')
          .expect(400)
      });
    })

    // describe('POST /auth/login',()=> {
    //   it.only('login sucessufuly', ()=> {
    //     return request(app.getHttpServer())
    //       .post('users/auth/login')
    //       .send({
    //         Username: "username",
    //         Password: "password"
    //       })
    //       .set('Accept', 'application/json')
    //       .expect(201)
    //       .expect({
    //         "access_token": "fake_token"
    //       })
    //   })
    // })
  })

  describe('Trips', () => {
    describe('POST /users/:userId/trips', () => {
      it('create a new trip', () => {
        jest.mock('uuid', () => ({ v4: () => mockedId }));

        const tripDTO: createTripDTO = {
          Date: new Date().toDateString(),
          OriginCity: 'Ghotam',
          DestinationCity: 'Metropolis',
          People: ['Batman', 'Superman']
        }

        const trip = {
          TripID: mockedId,
          ...tripDTO
        }

        mockGetDynamoose.mockResolvedValue({
          Username: mockedUser.Username
        })

        return request(app.getHttpServer())
          .post(`/users/${mockedUser.Username}/trips`)
          .set('Authorization', `bearer ${fakeToken}`)
          .send(tripDTO)
          .set('Accept', 'application/json')
          .expect(201)
          .then(() => {
            expect(mockUpdateDynamoose.mock.calls.length).toBe(1)
            expect(mockUpdateDynamoose.mock.calls[0][0].Trips).toEqual([{
              ...trip
            }])
          })
      });
    })

    describe('GET /users/:userId/trips/tripId', () => {
      it('Get one trip', () => {
        mockGetDynamoose.mockResolvedValueOnce(mockedUser)

        return request(app.getHttpServer())
          .get(`/users/${mockedUser.Username}/trips/${mockedUser.Trips[1].TripID}`)
          .set('Authorization', `bearer ${fakeToken}`)
          .expect(200)
          .expect(mockedUser.Trips[1])
      })
    })

    describe('GET /users/:userId/trips', () => {
      it('Get all trips', async () => {
        mockGetDynamoose.mockResolvedValueOnce(mockedUser)

        return request(app.getHttpServer())
          .get(`/users/${mockedUser.Username}/trips`)
          .set('Authorization', `bearer ${fakeToken}`)
          .expect(200)
          .expect(mockedUser.Trips)
      })
    })

    describe('PUT /users/:userId/trips/:tripId', () => {
      it('Add people in a trip', () => {
        mockGetDynamoose.mockResolvedValue(mockedUser)

        const requestBody = { "People": ["p3", "p4"] }

        return request(app.getHttpServer())
          .put(`/users/${mockedUser.Username}/trips/${mockedUser.Trips[0].TripID}`)
          .set('Authorization', `bearer ${fakeToken}`)
          .send(requestBody)
          .expect(200)
          .then(() => {
            expect(mockUpdateDynamoose.mock.calls.length).toBe(1)
            expect(mockUpdateDynamoose.mock.calls[0][0].Trips[0].People).toEqual(
              ["p1","p2","p3","p4"]
            )
          })
      })
    })

    describe('REMOVE /users/:userId/trips/:tripId', () => {
      it('remove a trip', () => {
        mockGetDynamoose.mockResolvedValueOnce(mockedUser)

        const expectedResult = Object.assign({}, mockedUser.Trips[1])

        return request(app.getHttpServer())
          .delete(`/users/${mockedUser.Username}/trips/${mockedUser.Trips[0].TripID}`)
          .set('Authorization', `bearer ${fakeToken}`)
          .expect(200)
          .expect([expectedResult])
      })
    })
  })
});
