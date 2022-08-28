import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import logger from 'winston';

import { IUserVerification, UserVerificationModel } from '../utils/types';


// TODO: consider upping bcrypt round to 13

// create the schema for the database using the interface and the model
const userVerificationSchema = new mongoose.Schema<IUserVerification, UserVerificationModel>(
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
        },
        PSK: {
            type: String,
            required: true
        },
        IV: {
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

userVerificationSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate() as mongoose.UpdateQuery<IUserVerification>;

    if (update.masterPwdHash) {
        await bcrypt.hash(update.masterPwdHash as string, 12)
            .then(hash => {
                logger.debug('[USER_VERIFICATION_MODEL] Password hash created');
                update.masterPwdHash = hash;
            })
            .catch(err => {
                return next(err as Error);
            });
    }

    this.setUpdate(update);
});

userVerificationSchema.static('build', (item) => new UserVerification(item));

const UserVerification = mongoose.model<IUserVerification, UserVerificationModel>(
    'UserVerification', userVerificationSchema, 'UsersVerifications');


export default UserVerification;
