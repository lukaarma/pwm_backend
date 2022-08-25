import Joi from 'joi';
import { LoginBody, SignupBody, UpdateProfileBody, SendVerificationBody } from './types';


// TODO: add custom errors

/* NOTE: don't use loginSchema.keys(...) to extend this into the signupSchema
because we can't set the correct typescript type that way */
const loginSchema = Joi.object<LoginBody>({
    email: Joi.string().email().required().trim(),
    masterPwdHash: Joi.string().required()
}).preferences({ abortEarly: false, stripUnknown: true });

const signupSchema = Joi.object<SignupBody>({
    email: Joi.string().email().required().trim(),
    masterPwdHash: Joi.string().required(),
    firstName: Joi.string().trim().pattern(/^[\p{L}][ \p{L}'-]*[\p{L}]$/u).required(),
    lastName: Joi.string().trim().pattern(/^[\p{L}][ \p{L}'-]*[\p{L}]$/u).required()
}).preferences({ abortEarly: false, stripUnknown: true });

const updateProfileSchema = Joi.object<UpdateProfileBody>({
    firstName: Joi.string().trim().pattern(/^[\p{L}][ \p{L}'-]*[\p{L}]$/u),
    lastName: Joi.string().trim().pattern(/^[\p{L}][ \p{L}'-]*[\p{L}]$/u)
});

const SendVerificationSchema = Joi.object<SendVerificationBody>({
    email: Joi.string().email().required().trim()
}).preferences({ abortEarly: false, stripUnknown: true });

const verificationTokenSchema = Joi.string().guid({
    version: [
        'uuidv4',
    ]
});


export { loginSchema, signupSchema, updateProfileSchema, SendVerificationSchema, verificationTokenSchema };
