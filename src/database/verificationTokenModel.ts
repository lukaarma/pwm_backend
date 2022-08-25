import mongoose from 'mongoose';

import { IVerificationToken, VerificationTokenModel } from '../utils/types';


// create the schema for the database using the interface and the model
const verificationTokenSchema = new mongoose.Schema<IVerificationToken, VerificationTokenModel>(
    {
        token: {
            type: String,
            required: true,
            unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        }
    }
);

verificationTokenSchema.index({ createdAt: 1 }, { expires: '4h' });

// add static build method used to create new verification token and typechecks them with Typescript
verificationTokenSchema.static('build', (item) => new VerificationToken(item));

const VerificationToken = mongoose.model<IVerificationToken, VerificationTokenModel>(
    'VerificationToken', verificationTokenSchema, 'VerificationTokens');

export default VerificationToken;
