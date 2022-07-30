import mongoose from 'mongoose';


// Create Typescipt interface that reflects the Mongoose schema
type IUser = {
    mail: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    createdAt?: Date
}

// Create Mongoose model that knows the new static methods added
type UserModel = mongoose.Model<IUser> & {
    build(item: IUser): mongoose.Document<IUser>
};

// create the schema for the database using the interface and the model
const userSchema = new mongoose.Schema<IUser, UserModel>(
    {
        mail: {
            type: String,
            required: true,
            unique: true
        },
        passwordHash: {
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
        createdAt: {
            type: Date,
            required: true,
            default: Date.now()
        }
    },
    { timestamps: true }
);


// add static build method used to create new users and typecheck them with Typescript
userSchema.static('build', (item) => new User(item));

const User = mongoose.model<IUser, UserModel>('User', userSchema, 'users');
export default User;
