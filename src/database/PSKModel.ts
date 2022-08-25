import mongoose from 'mongoose';

import { IProtSymKey, IPSKToJSON, PSKModel } from '../utils/types';

// create the schema for the database using the interface and the model
const PSKSchema = new mongoose.Schema<IProtSymKey, PSKModel>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true
        },
        key: {
            type: String,
            required: true
        },
        IV: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    },
);

// remove sensitive/useless information from the JSON sent to the clients
PSKSchema.set('toJSON', {
    versionKey: false,
    transform: (_, ret: IPSKToJSON) => {
        delete ret.userId;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
    }
});

// add static build method used to create new users and typecheck them with Typescript
PSKSchema.static('build', (item) => new ProtSymKey(item));
const ProtSymKey = mongoose.model<IProtSymKey, PSKModel>(
    'ProtectedSymmetricKey', PSKSchema, 'ProtectedSymmetricKeys');

export default ProtSymKey;
