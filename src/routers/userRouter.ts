import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { v4 as UUIDv4 } from 'uuid';
import logger from 'winston';

import User from '../database/userModel';
import UserVerification from '../database/userVerificationModel';
import VerificationToken from '../database/verificationTokenModel';
import { WEB_ERRORS, WEB_MESSAGES } from '../utils/messages';
import { SignupBody, UpdateProfileBody, SendVerificationBody, LoginBody } from '../utils/types';
import sendVerificationEmail from '../utils/verificationEmail';



/* TODO:
    - validate user input
    - better error handling!
    - email revalidation if token timeout
*/

/* FIXME
    - require old password for update password
*/
const userRouter = express.Router();

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/login', async (req, res) => {
    const login: LoginBody = req.body as LoginBody;

    logger.verbose(`[LOGIN] New login request from ${login.email}`);

    const user = await User.findOne({ email: login.email });

    if (user && (await user.validateMPH(login.masterPwdHash))) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        logger.debug(`[LOGIN] bearer token created for ${login.email}`);

        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({
            firstName: user.firstName
        });
    }
    else {
        logger.debug(`[LOGIN] login failed for ${login.email}: ${user ? 'Wrong password' : 'Wrong email'}`);

        res.status(401).json(WEB_ERRORS.LOGIN_FAILED);
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/signup', async (req, res) => {
    const signup: SignupBody = req.body as SignupBody;

    logger.verbose(`[SIGNUP] New signup request: '${signup.email}' (${signup.lastName} ${signup.firstName})`);

    if (!await User.exists({ email: signup.email })) {
        // with 'upsert: true' if no document is found it will insert a new one
        await UserVerification.findOneAndUpdate(
            { email: signup.email },
            signup,
            { runValidators: true, new: true, upsert: true }
        ).then(async (newUser) => {
            logger.debug(`[SIGNUP] New user signup '${signup.email}'`);

            res.status(200).json(WEB_MESSAGES.VERIFICATION_TOKEN_SENT(signup.email));

            await createVerificationToken(newUser._id, signup.email);
        }).catch((err: Error) => {
            logger.error({ message: err });
            logger.debug(`[SIGNUP] Failed new user signup, db error '${signup.email}'`);

            return res.status(500).json(WEB_ERRORS.SIGNUP_ERROR);
        });
    }
    else {
        logger.warn(`[SIGNUP] Failed new user signup, already exists '${signup.email}'`);

        res.status(200).json(WEB_MESSAGES.VERIFICATION_TOKEN_SENT(signup.email));
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
    const profile: UpdateProfileBody = req.body as UpdateProfileBody;

    logger.verbose(`[PROFILE] Updated profile with id '${req.jwtInfo.id}'`);

    const user = await User.findOneAndUpdate(
        { _id: req.jwtInfo.id },
        { firstName: profile.firstName, lastName: profile.lastName },
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
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/verify/sendVerification', async (req, res) => {
    const { email } = req.body as SendVerificationBody;

    logger.verbose(`[VERIFY] Requested new verification token for '${email}'`);

    const { _id } = await UserVerification.exists({ email }) ?? { _id: null };
    if (_id) {
        await createVerificationToken(_id, email);
    }

    res.status(200).send(WEB_MESSAGES.VERIFICATION_TOKEN_SENT(email));
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.get('/verify/:token', async (req, res) => {
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

            await user.save();
            await userVerification.remove();
            // delete all floating token for the user
            await VerificationToken.deleteMany({ _id: token.userId });

            logger.debug(`[VERIFY] User '${user.email}' verified`);

            res.status(301).redirect('/login');

            // res.status(200).send(WEB_MESSAGES.PROFILE_VERIFIED);
        }
        else {
            logger.error(`[VERIFY] This is fine. Received valid token with '${token.token}' invalid userId '${token.userId.toString()}'`);
            res.status(500).json(WEB_ERRORS.EVERYTHING_IS_ON_FIRE);
        }
    }
    else {
        logger.debug(`[VERIFY] Invalid, expired or already verified token submitted '${req.params.token}'`);
        res.status(400).json(WEB_ERRORS.INVALID_VERIFICATION_TOKEN);
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
