import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import logger from 'winston';

import { IUser, IUserToJSON, UserModel } from '../utils/types';


/*
TODO:
    - consider upping bcrypt round to 13
    - consider merging userModel.ts and userVerificationModel.ts
*/

// create the schema for the database using the interface and the model
const userSchema = new mongoose.Schema<IUser, UserModel>(
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
        timestamps: true,
        methods: {
            validateMPH(candidate: string): Promise<boolean> {
                return bcrypt.compare(candidate, this.masterPwdHash);
            }
        }
    },

);

/* NOTE: only hash on update, when we transfer the user from
the userVerification collection password is already hashed */
userSchema.pre('save', async function (next) {
    if (!this.isNew && this.isModified('password')) {
        await bcrypt.hash(this.masterPwdHash, 12)
            .then(hash => {
                logger.debug('[USER_MODEL] Password hash created');
                this.masterPwdHash = hash;
            })
            .catch(err => {
                return next(err as Error);
            });
    }
});

userSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate() as mongoose.UpdateQuery<IUser>;

    if (update.email) {
        delete update.email;
    }

    if (update.masterPwdHash) {
        await bcrypt.hash(update.masterPwdHash as string, 12)
            .then(hash => {
                logger.debug('[USER_MODEL] Password hash created');
                update.masterPwdHash = hash;
            })
            .catch(err => {
                return next(err as Error);
            });
    }

    this.setUpdate(update);
});

// remove sensitive/useless information from the JSON sent to the clients
userSchema.set('toJSON', {
    versionKey: false,
    transform: (_, ret: IUserToJSON) => {
        delete ret.masterPwdHash;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
    }
});

// add static build method used to create new users and typecheck them with Typescript
userSchema.static('build', (item) => new User(item));
const User = mongoose.model<IUser, UserModel>('User', userSchema, 'Users');

export default User;
