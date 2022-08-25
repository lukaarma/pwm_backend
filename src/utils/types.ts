import { Jwt } from 'jsonwebtoken';
import mongoose from 'mongoose';


// extend default JWT fields
type JwtInfo = Jwt & {
    id: string;
}

// add JWT token info in Express request
declare module 'express-serve-static-core' {
    // NOTE: must be interface to type merge with @types/express declaration
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
        jwtInfo: JwtInfo;
    }
}

// extending process.env, cannot delcare module because not exported as module in @types/node
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production'
            JWT_SECRET: string,
            SERVER_HOSTNAME: string,
            SERVER_PORT: number,
            MONGODB_SERVER: string,
            MONGODB_NAME: string,
            MAILGUN_DOMAIN: string,
            MAILGUN_USERNAME: string,
            MAILGUN_PASSWORD: string
        }
    }
}

export { JwtInfo };


/* ===== API types ===== */

type LoginBody = {
    email: string,
    password: string
}

type SignupBody = {
    email: string,
    masterPwdHash: string,
    firstName: string,
    lastName: string
}

type UpdateProfileBody = {
    firstName?: string,
    lastName?: string
}

export { LoginBody, SignupBody, UpdateProfileBody };


/* ===== Mongoose ===== */

// Create Typescipt interface that reflects the Mongoose schema
type IUser = {
    email: string,
    masterPwdHash: string,
    firstName: string,
    lastName: string
}
// Create Typescipt interface that reflects Mongoose's
// JSON serialization object with optional fields to remove them
type IUserToJSON = {
    email: string,
    masterPwdHash?: string,
    firstName: string,
    lastName: string,
    _id?: string,
    createdAt?: Date,
    updatedAt?: Date
}

// Create interface for the method added to the document
type IUserMethods = {
    // validate Master Password Hashs
    validateMPH(candidate: string): Promise<boolean>
}

// Create Mongoose model that knows the signature of
// the new static methods added to the model and the document
type UserModel = mongoose.Model<IUser, unknown, IUserMethods> & {
    build(item: IUser): mongoose.Document<IUser> & IUser & {
        _id: mongoose.Types.ObjectId
    }
}

export { IUser, IUserToJSON, UserModel };

// Create Typescipt interface that reflects the Mongoose schema for verification token
type IVerificationToken = {
    userId: mongoose.Types.ObjectId,
    token: string
}

type VerificationTokenModel = mongoose.Model<IVerificationToken, unknown, unknown> & {
    build(item: IVerificationToken): mongoose.Document<IVerificationToken> & IVerificationToken & {
        _id: mongoose.Types.ObjectId
    }
}

export { IVerificationToken, VerificationTokenModel };

// Create Typescipt interface that reflects the Mongoose schema for protected symmetric key
type IProtSymKey = {
    userId: mongoose.Types.ObjectId,
    key: string,
    IV: string
}

type IPSKToJSON = {
    userId?: mongoose.Types.ObjectId,
    key: string,
    IV: string,
    _id?: string,
    createdAt?: Date,
    updatedAt?: Date
}

type PSKModel = mongoose.Model<IProtSymKey, unknown, unknown> & {
    build(item: IProtSymKey): mongoose.Document<IProtSymKey> & IProtSymKey & {
        _id: mongoose.Types.ObjectId
    }
}

export { IProtSymKey, IPSKToJSON, PSKModel };
