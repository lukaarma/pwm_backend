import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import logger from 'winston';

import { User, UserVerification } from '../database/userModel';
import VerificationToken from '../database/verificationTokenModel';
import { WEB_ERRORS } from '../utils/messages';
import { LoginBody, SignupBody } from '../utils/types';


/* TODO:
    - validate user input
    - email validation
    - better error handling!
    - email revalidation if token timeout
*/
const userRouter = express.Router();

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/login', async (req, res) => {
    const login: LoginBody = req.body as LoginBody;

    logger.verbose(`[LOGIN] New login request from ${login.email}`);

    const user = await User.findOne({ email: login.email });

    if (user && (await user.validatePassword(login.password))) {
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

    if (!await User.exists({ email: signup.email }) || !await UserVerification.exists({ email: signup.email })) {
        const newUser = UserVerification.build({
            email: signup.email,
            password: signup.password,
            firstName: signup.firstName,
            lastName: signup.lastName
        });

        await newUser.save()
            .then(async () => {
                logger.debug(`[SIGNUP] New user signup '${signup.email}'`);

                res.status(200).json({
                    code: 103,
                    message: `A confirmation email was sent to '${signup.email}'. Please check your inbox.'`
                });

                const verificationToken = VerificationToken.build({
                    token: uuidv4(),
                    userId: newUser._id
                });
                await verificationToken.save();

                logger.debug(`[TOKEN] Token '${verificationToken.token}' created for account '${newUser.email}'`);
            }).catch((err: Error) => {
                logger.error({ message: err });
                logger.debug(`[SIGNUP] Failed new user signup, db error '${signup.email}'`);

                return res.status(500).json(WEB_ERRORS.SIGNUP_ERROR);
            });
    }
    else {
        logger.debug(`[SIGNUP] Failed new user signup, already exists '${signup.email}'`);

        res.status(400).json({
            code: 103,
            message: `A confirmation email was sent to '${signup.email}'. Please check your inbox.'`
        });
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
    const profile: SignupBody = req.body as SignupBody;

    logger.verbose(`[PROFILE] Updated profile with id '${req.jwtInfo.id}'`);

    const user = await User.findOneAndUpdate(
        { _id: req.jwtInfo.id },
        profile
    );

    if (user) {
        logger.debug(`[PROFILE] updated user '${user.email}' with id '${req.jwtInfo.id}':\n\t` +
            `${user.firstName} => ${profile.firstName}\n\t${user.lastName} => ${profile.lastName}`);

        res.status(200).json(user.toJSON());
    }
    else {
        logger.error(`[PROFILE] This is fine. Request in auth route '${req.path}' with JWT and invalid id.`);
        res.status(500).json(WEB_ERRORS.EVERYTHING_IS_ON_FIRE);
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.get('/verify/:token', async (req, res) => {
    logger.verbose(`[VERIFY] Requested verification for token '${req.params.token}'`);

    const token = await VerificationToken.findOne({ token: req.params.token });
    if (token) {
        logger.debug(`[VERIFY] Found token '${token.token}' for userId '${token.userId.toString()}'`);

        const user = await UserVerification.findOne({ _id: token.userId });
        if (user) {
            logger.debug(`[VERIFY] Found user '${user.email}' with userId '${user.id}'`);

            const verifiedUser = User.build({
                email: user.email,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName
            });

            await verifiedUser.save();
            await user.remove();
            await token.remove();

            logger.debug(`[VERIFY] User '${user.email}' verified`);

            res.status(200).send();
        }
        else {
            logger.error(`[VERIFY] This is fine. Recived valid token with '${token.token}' invalid userId '${token.userId.toString()}'`);
            res.status(500).json(WEB_ERRORS.EVERYTHING_IS_ON_FIRE);
        }
    }
    else {
        logger.debug(`[VERIFY] Invalid, expired or already verified token submitted '${req.params.token}'`);
        res.status(400).json(WEB_ERRORS.INVALID_VERIFICAION_TOKEN);
    }
});

export default userRouter;
