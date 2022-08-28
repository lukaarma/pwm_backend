import Joi from 'joi';
import { LoginBody, SignupBody, UpdateProfileBody, SendVerificationBody } from './types';


// TODO: add custom errors

/* NOTE: don't use loginSchema.keys(...) to extend this into the signupSchema
because we can't set the correct typescript type that way */
const loginSchema = Joi.object<LoginBody>({
    email: Joi.string().trim().email().required(),
    masterPwdHash: Joi.string().trim().hex().length(144).required()
}).preferences({ abortEarly: false, stripUnknown: true });

const signupSchema = Joi.object<SignupBody>({
    email: Joi.string().trim().email().required(),
    masterPwdHash: Joi.string().trim().hex().length(144).required(),
    firstName: Joi.string().pattern(/^[\p{L}][ \p{L}'-]*[\p{L}]$/u).required(),
    lastName: Joi.string().pattern(/^[\p{L}][ \p{L}'-]*[\p{L}]$/u).required(),
    PSK: Joi.string().trim().hex().length(96).required(),
    IV: Joi.string().trim().hex().length(32).required(),
}).preferences({ abortEarly: false, stripUnknown: true });

const updateProfileSchema = Joi.object<UpdateProfileBody>({
    firstName: Joi.string().pattern(/^[\p{L}][ \p{L}'-]*[\p{L}]$/u),
    lastName: Joi.string().pattern(/^[\p{L}][ \p{L}'-]*[\p{L}]$/u)
});

const sendVerificationSchema = Joi.object<SendVerificationBody>({
    email: Joi.string().trim().email().required()
}).preferences({ abortEarly: false, stripUnknown: true });

const verificationTokenSchema = Joi.string().trim().guid({ version: ['uuidv4'] });


export { loginSchema, signupSchema, updateProfileSchema, sendVerificationSchema, verificationTokenSchema };
