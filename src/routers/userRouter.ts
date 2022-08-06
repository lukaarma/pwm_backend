import express from 'express';
import jwt from 'jsonwebtoken';
import logger from 'winston';

import User from '../database/userModel';
import { LoginBody, SignupBody } from '../utils/types';


/* TODO:
    - validate user input
    - move response messages in utils/message.ts
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
        res.status(401).json({
            code: 100,
            type: 'FailedLogin',
            message: 'Wron username or password!'
        });
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

                res.status(200).json(newUser.toJSON());
            }).catch((err: Error) => {
                logger.error({ message: err });
                logger.debug(`[SIGNUP] Failed new user signup, db error '${signup.email}'`);

                res.status(500).json({
                    code: 102,
                    type: 'SignupError',
                    message: 'Server side error, please try again later'
                });
            });
    }
    else {
        logger.debug(`[SIGNUP] Failed new user signup, already exists '${signup.email}'`);
        // FIXME: change this to the same "Confermation email" message of succes to prevent user enum
        res.status(400).json({
            code: 103,
            type: 'EmailNotAviable',
            message: 'The email is already assigned to a user'
        });
    }
});

export default userRouter;
