import express from 'express';
import jwt from 'jsonwebtoken';
import logger from 'winston';

import User from '../database/userModel';
import { WEB_ERRORS } from '../utils/messages';
import { LoginBody, SignupBody } from '../utils/types';


/* TODO:
    - validate user input
    - email validation
    - better error handling!
*/
const userRouter = express.Router();

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/login', async (req, res) => {
    const login: LoginBody = req.body as LoginBody;

    logger.verbose(`[LOGIN] New login request from ${login.email}`);

    const user = await User.findOne({ email: login.email });

    if (user && (await user.validatePassword(login.password))) {
        // NOTE: already checked during initialization
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        logger.debug(`[LOGIN] bearer token created for ${login.email}`);

        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({
            firstName: user?.firstName
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
        const newUser = User.build({
            email: signup.email,
            password: signup.password,
            firstName: signup.firstName,
            lastName: signup.lastName
        });

        newUser.save()
            .then(() => {
                logger.debug(`[SIGNUP] New user signup '${signup.email}'`);

                // FIXME: change this to "Confermation email" message
                res.status(200).json(newUser.toJSON());
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
        logger.debug(`[SIGNUP] updated user '${user.email}' with id '${req.jwtInfo.id}':\n\t` +
            `${user.firstName} => ${profile.firstName}\n\t${user.lastName} => ${profile.lastName}`);

        res.status(200).json(user.toJSON());
    }
    else {
        logger.error(`This is fine. Request in auth route '${req.path}' without JWT.`);
        res.status(500).json({
            code: 999,
            type: 'EverythingIsOnFire',
            message: 'This is fine. Request in auth route without JWT.'
        });
    }
});

export default userRouter;
