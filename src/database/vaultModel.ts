import mongoose from 'mongoose';

import { IVault, IVaultToJSON, VaultModel } from '../utils/types';


// create the schema for the database using the interface and the model
const vaultSchema = new mongoose.Schema<IVault, VaultModel>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
        version: {
            type: Number,
            required: true,
        },
        lastModified: {
            type: Date,
            required: true,
        },
        IV: {
            type: String,
            required: true,
        },
        data: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// remove sensitive/useless information from the JSON sent to the clients
vaultSchema.set('toJSON', {
    versionKey: false,
    transform: (_, ret: IVaultToJSON) => {
        delete ret.userId;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
    },
});

// add static build method used to create new users and typechecks them with Typescript
vaultSchema.static('build', (item) => new Vault(item));

const Vault = mongoose.model<IVault, VaultModel>(
    'Vault',
    vaultSchema,
    'Vaults'
);

export default Vault;
