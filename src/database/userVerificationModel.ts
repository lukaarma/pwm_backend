import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import logger from 'winston';

import { IUser, UserModel } from '../utils/types';


/*
TODO:
    - consider upping bcrypt round to 13
    - consider merging userModel.ts and userVerificationModel.ts
*/

// create the schema for the database using the interface and the model
const userVerificationSchema = new mongoose.Schema<IUser, UserModel>(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        masterPwdHash: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: true
        }
    },

);
userVerificationSchema.index({ updatedAt: 1 }, { expires: '4h' });

userVerificationSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        await bcrypt.hash(this.masterPwdHash, 12)
            .then(hash => {
                logger.debug('[USER_VERIFICATION_MODEL] Password hash created');
                this.masterPwdHash = hash;
            })
            .catch(err => {
                return next(err as Error);
            });
    }
});

userVerificationSchema.static('build', (item) => new UserVerification(item));
const UserVerification = mongoose.model<IUser, UserModel>(
    'UserVerification', userVerificationSchema, 'UsersVerification');

export default UserVerification;
