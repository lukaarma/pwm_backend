import Joi from 'joi';
import { LoginBody, SignupBody, UpdateProfileBody, SendVerificationBody, PSKBody, VaultBody } from './types';


// TODO: add custom errors

// Bcrypt max input size => 72 Bytes => x2 because hex encoding (2 hex char per byes)
const MPHLength = 72 * 2;
// Bit size / 4 because hex encoding (4 bit per hex char)
const IVLength = 128 / 4;
// 3 128 bit block / 4 because hex encoding (4 bit per hex char)
const PSKLength = 128 * 3 / 4;
const nameRegex = /^[\p{L}][ \p{L}'-]*[\p{L}]$/u;

/* NOTE: don't use loginSchema.keys(...) to extend this into the signupSchema
because we can't set the correct typescript type that way */
const loginSchema = Joi.object<LoginBody>({
    email: Joi.string().trim().email().required(),
    masterPwdHash: Joi.string().trim().hex().length(MPHLength).required()
}).preferences({ abortEarly: false, stripUnknown: true });

const signupSchema = Joi.object<SignupBody>({
    email: Joi.string().trim().email().required(),
    masterPwdHash: Joi.string().trim().hex().length(MPHLength).required(),
    firstName: Joi.string().pattern(nameRegex).required(),
    lastName: Joi.string().pattern(nameRegex).required(),
    IV: Joi.string().trim().hex().length(IVLength).required(),
    PSK: Joi.string().trim().hex().length(PSKLength).required()
}).preferences({ abortEarly: false, stripUnknown: true });

const updateProfileSchema = Joi.object<UpdateProfileBody>({
    firstName: Joi.string().pattern(nameRegex),
    lastName: Joi.string().pattern(nameRegex)
});

const sendVerificationSchema = Joi.object<SendVerificationBody>({
    email: Joi.string().trim().email().required()
}).preferences({ abortEarly: false, stripUnknown: true });

const verificationTokenSchema = Joi.string().trim().uuid({
    version: ['uuidv4']
}).preferences({ stripUnknown: true });

const PSKSchema = Joi.object<PSKBody>({
    IV: Joi.string().trim().hex().length(IVLength).required(),
    PSK: Joi.string().trim().hex().length(PSKLength).required()
}).preferences({ abortEarly: false, stripUnknown: true });

const vaultSchema = Joi.object<VaultBody>({
    version: Joi.number().positive().required(),
    lastModified: Joi.date().iso().required(),
    IV: Joi.string().trim().hex().length(IVLength).required(),
    data: Joi.string().trim().base64().required()
}).preferences({ abortEarly: false, stripUnknown: true });


export { loginSchema, signupSchema, updateProfileSchema, sendVerificationSchema, verificationTokenSchema, PSKSchema, vaultSchema };
