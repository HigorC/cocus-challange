import * as dynamoose from 'dynamoose';

export const TripSchema = new dynamoose.Schema(
    {
        Id: {
            hashKey: true,
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
    },
    {
        timestamps: true,
    },
);