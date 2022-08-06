import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import logger from 'winston';
import { IUser, IUserToJSON, UserModel } from '../utils/types';


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
    if (this.isNew || this.isModified('passwordHash')) {
        await bcrypt.hash(this.password, 12)
            .then(hash => {
                logger.debug('[USER_MODEL] New password hash created');
                this.password = hash;
            })
            .catch(err => next(err as Error));
    }
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

export default User;
