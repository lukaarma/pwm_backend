import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { v4 as UUIDv4 } from 'uuid';
import logger from 'winston';

import User from '../database/userModel';
import UserVerification from '../database/userVerificationModel';
import VerificationToken from '../database/verificationTokenModel';
import ProtSymKey from '../database/PSKModel';
import { WEB_ERRORS, WEB_MESSAGES } from '../utils/messages';
import { loginSchema, sendVerificationSchema, signupSchema, updateProfileSchema, verificationTokenSchema } from '../utils/validators';
import sendVerificationEmail from '../utils/verificationEmail';


/* TODO:
    - better error handling!
    - email revalidation if token timeout
    - password update
    - return PSK, IV, Vault and Vault IV after login
*/

const userRouter = express.Router();

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/login', async (req, res) => {
    const { error, value } = loginSchema.validate(req.body, { stripUnknown: true });

    if (!error && value) {
        logger.verbose(`[LOGIN] New login request from ${value.email}`);

        const user = await User.findOne({ email: value.email });

        if (user && (await user.validateMPH(value.masterPwdHash))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            logger.debug(`[LOGIN] bearer token created for ${value.email}`);

            const PSK = await ProtSymKey.findOne({ userId: user._id });

            if (PSK) {
                res.setHeader('Authorization', `Bearer ${token}`);

                res.status(200).json({
                    firstName: user.firstName,
                    PSK: PSK.data,
                    IV: PSK.IV
                });
            }
            else {
                logger.warn(`[LOGIN] login failed for ${value.email}: missing PSK`);
                res.status(401).json(WEB_ERRORS.MISSING_PSK);
            }
        }
        else {
            logger.debug(`[LOGIN] login failed for ${value.email}: ${user ? 'Wrong password' : 'Wrong email'}`);

            res.status(401).json(WEB_ERRORS.LOGIN_FAILED);
        }
    }
    else {
        logger.error(`[LOGIN] Bad request! ${error.message}`);

        res.status(400).json(WEB_ERRORS.LOGIN_BAD_REQUEST(error.message));
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/signup', async (req, res) => {
    const { error, value } = signupSchema.validate(req.body, { stripUnknown: true });

    if (!error && value) {
        logger.verbose(`[SIGNUP] New signup request: '${value.email}' (${value.lastName} ${value.firstName})`);

        if (!await User.exists({ email: value.email })) {
            // with 'upsert: true' if no document is found it will insert a new one
            await UserVerification.findOneAndUpdate(
                { email: value.email },
                value,
                { runValidators: true, new: true, upsert: true }
            ).then(async (newUser) => {
                logger.debug(`[SIGNUP] New user signup '${value.email}'`);

                res.status(200).json(WEB_MESSAGES.VERIFICATION_TOKEN_SENT(value.email));

                await createVerificationToken(newUser._id, value.email);
            }).catch((err: Error) => {
                logger.error({ message: err });
                logger.debug(`[SIGNUP] Failed new user signup, db error '${value.email}'`);

                return res.status(500).json(WEB_ERRORS.SIGNUP_ERROR);
            });
        }
        else {
            logger.warn(`[SIGNUP] Failed new user signup, already exists '${value.email}'`);

            res.status(200).json(WEB_MESSAGES.VERIFICATION_TOKEN_SENT(value.email));
        }
    }
    else {
        logger.error(`[SIGNUP] Bad request! ${error.message}`);

        res.status(400).json(WEB_ERRORS.SIGNUP_BAD_REQUEST(error.message));
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.get('/profile', async (req, res) => {
    logger.verbose(`[PROFILE] Requested profile with id '${req.jwtInfo.id}'`);

    const user = await User.findOne({ _id: req.jwtInfo.id });
    if (user) {
        logger.debug(`[PROFILE] Found user '${user.email}' with id '${req.jwtInfo.id}'`);

        res.status(200).json(user.toJSON());
    }
    else {
        logger.error(`[PROFILE] This is fine. Request in auth route '${req.path}' with JWT and invalid id.`);
        res.status(500).json(WEB_ERRORS.EVERYTHING_IS_ON_FIRE);
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.put('/profile', async (req, res) => {
    const { error, value } = updateProfileSchema.validate(req.body);

    if (!error && value) {
        logger.verbose(`[PROFILE] Updated profile with id '${req.jwtInfo.id}'`);

        const user = await User.findOneAndUpdate(
            { _id: req.jwtInfo.id },
            { firstName: value.firstName, lastName: value.lastName },
            { new: true }
        );

        if (user) {
            logger.debug(`[PROFILE] updated user '${user.email}' with id '${req.jwtInfo.id}':\n\t` +
                `New first name: ${user.firstName}\n\tNew last name: ${user.lastName}`);

            res.status(200).json(user.toJSON());
        }
        else {
            logger.error(`[PROFILE] This is fine. Request in auth route '${req.path}' with JWT and invalid id.`);
            res.status(500).json(WEB_ERRORS.EVERYTHING_IS_ON_FIRE);
        }
    }
    else {
        logger.error(`[PROFILE] Bad request! ${error.message}`);

        res.status(400).json(WEB_ERRORS.UPDATE_PROFILE_BAD_REQUEST(error.message));
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/verify/sendVerification', async (req, res) => {
    const { error, value } = sendVerificationSchema.validate(req.body);

    if (!error && value) {
        const { email } = value;

        logger.verbose(`[VERIFY] Requested new verification token for '${email}'`);

        const { _id } = await UserVerification.exists({ email }) ?? { _id: null };
        if (_id) {
            await createVerificationToken(_id, email);
        }

        res.status(200).send(WEB_MESSAGES.VERIFICATION_TOKEN_SENT(email));
    }
    else {
        logger.error(`[VERIFY] Bad request! ${error.message}`);

        res.status(400).json(WEB_ERRORS.SEND_VERIFICATION_BAD_REQUEST(error.message));
    }
});


// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.get('/verify/:token', async (req, res) => {
    const { error } = verificationTokenSchema.validate(req.params.token);

    if (!error) {
        logger.verbose(`[VERIFY] Requested verification for token '${req.params.token}'`);

        const token = await VerificationToken.findOne({ token: req.params.token });
        if (token) {
            logger.debug(`[VERIFY] Found token '${token.token}' for userId '${token.userId.toString()}'`);

            const userVerification = await UserVerification.findOne({ _id: token.userId });
            if (userVerification) {
                logger.debug(`[VERIFY] Found user '${userVerification.email}' with userId '${userVerification.id}'`);

                const user = User.build({
                    email: userVerification.email,
                    masterPwdHash: userVerification.masterPwdHash,
                    firstName: userVerification.firstName,
                    lastName: userVerification.lastName
                });

                const PSK = ProtSymKey.build({
                    userId: user._id,
                    IV: userVerification.IV,
                    data: userVerification.PSK
                });

                await Promise.all([
                    user.save(),
                    PSK.save(),
                    userVerification.remove(),
                    // delete all floating token for the user
                    VerificationToken.deleteMany({ userId: token.userId })
                ]);

                logger.debug(`[VERIFY] User '${user.email}' verified`);

                res.status(301).redirect('/login');
            }
            else {
                logger.error(`[VERIFY] This is fine. Received valid token with '${token.token}' invalid userId '${token.userId.toString()}'`);
                res.status(500).json(WEB_ERRORS.EVERYTHING_IS_ON_FIRE);
            }
        }
        else {
            logger.debug(`[VERIFY] Expired or already verified token submitted '${req.params.token}'`);
            res.status(400).json(WEB_ERRORS.INVALID_VERIFICATION_TOKEN);
        }
    }
    else {
        logger.error(`[VERIFY] Bad request! ${error.message}`);

        res.status(400).json(WEB_ERRORS.VERIFY_TOKEN_BAD_REQUEST(error.message));
    }
});

export default userRouter;


async function createVerificationToken(userId: mongoose.Types.ObjectId, email: string): Promise<void> {

    const token = VerificationToken.build({
        token: UUIDv4(),
        userId
    });

    await token.save();
    logger.debug(`[TOKEN] Token '${token.token}' created for account '${email}'`);

    await sendVerificationEmail(email, token.token);
    logger.debug(`[TOKEN] Verification email sent to '${email}'`);
}
