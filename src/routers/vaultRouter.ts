import express from 'express';
import mongoose from 'mongoose';
import logger from 'winston';
import ProtSymKey from '../database/PSKModel';
import User from '../database/userModel';
import Vault from '../database/vaultModel';

import { WEB_ERRORS, WEB_MESSAGES } from '../utils/messages';
import { PSKSchema, vaultSchema, deleteSchema } from '../utils/validators';


// TODO: better error handling!

const vaultRouter = express.Router();

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
vaultRouter.get('/', async (req, res) => {
    logger.verbose(`[VAULT] Requested Encrypted Vault for user '${req.jwtInfo.id}'`);

    const vault = await Vault.findOne({ userId: req.jwtInfo.id });

    if (vault) {
        logger.debug(
            `[VAULT] Found Vault of user '${req.jwtInfo.id}' with vault id '${vault._id.toString()} '`
        );

        res.status(200).json(vault.toJSON());
    }
    else {
        logger.warn(`[VAULT] User '${req.jwtInfo.id}' requested non existing vault.`);
        res.status(400).json(WEB_ERRORS.MISSING_VAULT);
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
vaultRouter.post('/', async (req, res) => {
    const { error, value: vaultInfo } = vaultSchema.validate(req.body);

    if (!error && vaultInfo) {
        logger.verbose(`[VAULT] New Vault generated for user '${req.jwtInfo.id}'`);
        const vault = await Vault.exists({ userId: req.jwtInfo.id });

        if (!vault) {
            const newVault = Vault.build({
                userId: new mongoose.Types.ObjectId(req.jwtInfo.id),
                ...vaultInfo
            });

            await newVault
                .save()
                .then(() => {
                    res.status(200).json(WEB_MESSAGES.VAULT_SAVED_SUCCESS);
                    logger.debug(
                        `[VAULT] New Vault saved for user '${req.jwtInfo.id}'`
                    );
                })
                .catch((err: Error) => {
                    logger.error({ message: err });
                    logger.debug(
                        `[VAULT] Db error, failed to save new Vault for user '${req.jwtInfo.id}'`
                    );

                    return res.status(500).json(WEB_ERRORS.SAVE_VAULT_ERROR);
                });
        }
        else {
            logger.debug(
                `[VAULT] Failed new Vault save, already exists with id '${vault._id.toString()}'`
            );
            res.status(400).json(WEB_ERRORS.DUPLICATE_VAULT);
        }
    }
    else {
        logger.error(`[PSK] Bad request! ${error.message}`);

        res.status(400).json(WEB_ERRORS.VAULT_BAD_REQUEST(error.message));
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
vaultRouter.put('/', async (req, res) => {
    const { error, value: vaultUpdate } = vaultSchema.validate(req.body);

    if (!error && vaultUpdate) {
        logger.verbose(`[VAULT] Requested Vault update from user '${req.jwtInfo.id}'`);

        const vault = await Vault.findOne({ userId: req.jwtInfo.id });

        if (vault) {
            logger.debug(`[VAULT] Found vault '${vault._id.toString()}' for user '${req.jwtInfo.id}'`);

            if (vault.version > vaultUpdate.version) {
                logger.debug(`[VAULT] Ignoring Vault update because of lower version number than existing vault '${vault._id.toString()}'`);

                res.status(400).json(WEB_ERRORS.VAULT_LOWER_VERSION);
            }
            else if (vault.version === vaultUpdate.version && vault.lastModified > vaultUpdate.lastModified) {
                logger.debug(`[VAULT] Ignoring Vault update because of older last modified date than existing vault '${vault._id.toString()}'`);

                res.status(400).json(WEB_ERRORS.VAULT_OLDER_DATE);
            }
            else {
                await vault.update(vaultUpdate);
                logger.debug(`[VAULT] Updated vault '${vault._id.toString()}'`);

                res.status(200).json(WEB_MESSAGES.VAULT_UPDATED);
            }
        }
        else {
            logger.warn(`[VAULT] User '${req.jwtInfo.id}' updated non existing vault.`);
            res.status(400).json(WEB_ERRORS.MISSING_VAULT);
        }
    }
    else {
        logger.error(`[VAULT UPDATE] Bad request from '${req.jwtInfo.id}'! ${error.message}`);

        res.status(400).json(WEB_ERRORS.VAULT_BAD_REQUEST(error.message));
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
vaultRouter.post('/delete', async (req, res) => {
    const { error, value: vaultDelete } = deleteSchema.validate(req.body);

    if (!error && vaultDelete) {
        logger.verbose(`[VAULT DELETE] Requested Vault delete from user '${req.jwtInfo.id}'`);

        const user = await User.findById(req.jwtInfo.id);

        if (!user) {
            logger.warn(`[VAULT DELETE] Cannot find user with id '${req.jwtInfo.id}'`);

            return res.status(500).json(WEB_ERRORS.VALID_JWT_INVALID_ID);
        }
        else if (!await user.validateMPH(vaultDelete.masterPwdHash)) {
            logger.warn(`[VAULT DELETE] Delete failed for user '${req.jwtInfo.id}': wrong password`);

            return res.status(400).json(WEB_ERRORS.WRONG_PASSWORD);
        }

        const vault = await Vault.findOne({ userId: req.jwtInfo.id });

        if (vault) {
            await vault.remove();

            logger.debug(`[VAULT DELETE] Deleted vault ${vault.id} by '${req.jwtInfo.id}'`);

            res.status(200).json(WEB_MESSAGES.VAULT_DELETED);
        }
        else {
            logger.warn(`[VAULT DELETE] Delete of inexistent vault by '${req.jwtInfo.id}'`);

            res.status(400).json(WEB_ERRORS.MISSING_VAULT);
        }
    }
    else {
        logger.error(`[VAULT DELETE] Bad request from '${req.jwtInfo.id}'! ${error.message}`);

        res.status(400).json(WEB_ERRORS.DELETE_BAD_REQUEST(error.message));
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
vaultRouter.get('/key', async (req, res) => {
    logger.verbose(`[PSK] Requested Protected Symmetric Key for user '${req.jwtInfo.id}'`);

    const PSK = await ProtSymKey.findOne({ userId: req.jwtInfo.id });

    if (PSK) {
        logger.debug(
            `[PSK] Found protSymKey of user '${req.jwtInfo.id}' with key id '${PSK._id.toString()}'`
        );
        res.status(200).json(PSK.toJSON());
    }
    else {
        logger.warn(`[PSK] User '${req.jwtInfo.id}' requested non existing key.`);
        res.status(400).json(WEB_ERRORS.MISSING_PSK);
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
vaultRouter.post('/key', async (req, res) => {
    const { error, value: PSKInfo } = PSKSchema.validate(req.body);

    if (!error && PSKInfo) {
        logger.verbose(`[PSK] New PSK generated for user '${req.jwtInfo.id}'`);
        const PSK = await ProtSymKey.exists({ userId: req.jwtInfo.id });

        if (!PSK) {
            const newPSK = ProtSymKey.build({
                userId: new mongoose.Types.ObjectId(req.jwtInfo.id),
                ...PSKInfo
            });

            await newPSK
                .save()
                .then(() => {
                    res.status(200).json(WEB_MESSAGES.PSK_SAVED_SUCCESS);
                    logger.debug(
                        `[PSK] New PSK saved for user '${req.jwtInfo.id}'`
                    );
                })
                .catch((err: Error) => {
                    logger.error({ message: err });
                    logger.debug(
                        `[PSK] db error, failed to save new PSK for user '${req.jwtInfo.id}'`
                    );

                    return res.status(500).json(WEB_ERRORS.SAVE_PSK_ERROR);
                });
        }
        else {
            logger.debug(
                `[PSK] Failed new PSK save, already exists with id '${PSK._id.toString()}'`
            );
            res.status(400).json(WEB_ERRORS.DUPLICATE_PSK);
        }
    }
    else {
        logger.error(`[PSK] Bad request! ${error.message}`);

        res.status(400).json(WEB_ERRORS.PSK_BAD_REQUEST(error.message));
    }
});

// NOTE: Express 5 correctly handles Promises, Typescript declarations not yet up to date
// eslint-disable-next-line @typescript-eslint/no-misused-promises
vaultRouter.put('/key', async (req, res) => {
    const { error, value: PSKUpdate } = PSKSchema.validate(req.body);

    if (!error && PSKUpdate) {
        logger.verbose(`[PSK UPDATE]] Updated PSK with id '${req.jwtInfo.id}'`);

        const protSymKey = await ProtSymKey.findOneAndUpdate(
            { userId: req.jwtInfo.id },
            PSKUpdate,
            { new: true }
        );

        if (protSymKey) {
            logger.debug(`[PSK UPDATE]] updated psk '${protSymKey._id.toString()}' with user id '${req.jwtInfo.id}'`);

            res.status(200).json(protSymKey.toJSON());
        }
        else {
            logger.warn(
                `[PSK UPDATE] User '${req.jwtInfo.id}' updated non existing key.`
            );
            res.status(400).json(WEB_ERRORS.MISSING_PSK);
        }
    }
    else {
        logger.error(`[PSK UPDATE] Bad request! ${error.message}`);

        res.status(400).json(WEB_ERRORS.PSK_BAD_REQUEST(error.message));
    }
});



export default vaultRouter;
