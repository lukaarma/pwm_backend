import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import logger from 'winston';

import { IUser, IUserToJSON, UserModel } from '../utils/types';


// TODO: consider upping bcrypt round to 13

// create the schema for the database using the interface and the model
const userSchema = new mongoose.Schema<IUser, UserModel>(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
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
            validatePassword(candidate: string): Promise<boolean> {
                return bcrypt.compare(candidate, this.password);
            }
        }
    },

);

userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        await bcrypt.hash(this.password, 12)
            .then(hash => {
                logger.debug('[USER_MODEL] Password hash created');
                this.password = hash;
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

    if (update.password) {
        await bcrypt.hash(update.password as string, 12)
            .then(hash => {
                logger.debug('[USER_MODEL] Password hash created');
                update.password = hash;
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
        delete ret.password;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
    }
});

// add static build method used to create new users and typecheck them with Typescript
userSchema.static('build', (item) => new User(item));
const User = mongoose.model<IUser, UserModel>('User', userSchema, 'users');

/* NOTE: hack, since mongoose copies the schema we change the build method for the UserVerification
Doing so we can save to the correct collection instanzializing "new UserVerification" instead of "new User" */
userSchema.static('build', (item) => new UserVerification(item));
const UserVerification = mongoose.model<IUser, UserModel>('UserVerification', userSchema, 'usersVerification');

export { User, UserVerification };
