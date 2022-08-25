import express from 'express';
import logger from 'winston';

import { WEB_ERRORS } from '../utils/messages';



export const expressJSONHandler: express.ErrorRequestHandler = function (err, _, res, next) {
    if (err instanceof SyntaxError) {
        logger.error({ message: err });

        res.status(400).send(WEB_ERRORS.SYNTAX_BAD_REQUEST(err.message));
    }

    next();
};
