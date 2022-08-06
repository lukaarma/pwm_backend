import mongoose from 'mongoose';


// API types
type LoginBody = {
    email: string,
    password: string
}

type SignupBody = {
    email: string,
    password: string,
    firstName: string,
    lastName: string
}

export { LoginBody, SignupBody };


/* ===== Mongoose ===== */

// Create Typescipt interface that reflects the Mongoose schema
type IUser = {
    email: string,
    password: string,
    firstName: string,
    lastName: string
}
// Create Typescipt interface that reflects Mongoose's
// JSON serialization object with optional fields to remove them
type IUserToJSON = {
    email: string,
    password?: string,
    firstName: string,
    lastName: string
    _id?: string,
    createdAt?: string,
    updatedAt?: string
}

// Create interface for the method added to the document
type IUserMethods = {
    validatePassword(candidate: string): Promise<boolean>;
}

// Create Mongoose model that knows the signature of
// the new static methods added to the model and the document
type UserModel = mongoose.Model<IUser, unknown, IUserMethods> & {
    build(item: IUser): mongoose.Document<IUser>
};

export { IUser, IUserToJSON, UserModel };
