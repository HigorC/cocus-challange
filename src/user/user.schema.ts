import * as dynamoose from 'dynamoose';

export const UserSchema = new dynamoose.Schema(
    {
        Username: {
            hashKey: true,
            required: true,
            type: String,
        },
        Password: String,
        Trips: {
            type: Array,
            schema: [{
                type: Object,
                schema: {
                    TripID: {
                        required: true,
                        type: String,
                    },
                    People: {
                        type: Array,
                        schema: [String],
                    },
                    OriginCity: {
                        type: String
                    },
                    DestinationCity: {
                        type: String
                    },
                    Date: {
                        type: String
                    }
                }
            }]
        }
    }
);