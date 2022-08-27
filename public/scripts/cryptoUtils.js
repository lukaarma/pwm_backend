/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Email, Master Password => crypto.subtle.deriveKey => Master Key
// Master Password, Master Key => crypto.subtle.deriveBits => Master Password Hash


const encoder = new TextEncoder();

async function deriveMK(email, password) {
    if (typeof email !== 'string') {
        throw new TypeError('email must be a string!');
    }
    if (typeof password !== 'string') {
        throw new TypeError('password must be a string!');
    }

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            hash: 'SHA-512',
            salt: encoder.encode(email),
            iterations: 120000
        },
        await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        ),
        {
            name: 'AES-CBC',
            length: 256
        },
        true,
        // wrapKey/unwrapKey => to protect the SymmetricKey
        // derivekey => derive Master Password Hash
        ['wrapKey', 'unwrapKey']
    );
}

async function deriveMPH(password, masterKey) {
    if (typeof password !== 'string') {
        throw new TypeError('password must be a string!');
    }
    if (!(masterKey instanceof CryptoKey)) {
        throw new TypeError('masterKey must be a CryptoKey!');
    }


    return window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            hash: 'SHA-512',
            salt: encoder.encode(password),
            iterations: 1
        },
        await window.crypto.subtle.importKey(
            'raw',
            await window.crypto.subtle.exportKey('raw', masterKey),
            'PBKDF2',
            false,
            ['deriveBits']
        ),
        576
    );
}

async function decryptPSK(IV, masterKey, PSK) {
    if (!(IV instanceof Uint8Array)) {
        throw new TypeError('[decryptPSK] IV must be a Uint8Array!');
    }
    if (!(masterKey instanceof CryptoKey)) {
        throw new TypeError('[decryptPSK] masterKey must be a CryptoKey!');
    }
    if (!(PSK instanceof Uint8Array)) {
        throw new TypeError('[decryptPSK] PSK must be a Uint8Array!');
    }

    return window.crypto.subtle.unwrapKey(
        'raw',
        PSK,
        masterKey,
        {
            name: 'AES-CBC',
            iv: IV
        },
        {
            name: 'AES-CBC'
        },
        true,
        ['encrypt', 'decrypt']
    );
}

async function encryptSK(IV, masterKey, symmetricKey) {
    if (!(IV instanceof Uint8Array)) {
        throw new TypeError('[encryptSK] IV must be a Uint8Array!');
    }
    if (!(masterKey instanceof CryptoKey)) {
        throw new TypeError('[encryptSK] masterKey must be a CryptoKey!');
    }
    if ((symmetricKey instanceof Uint8Array)) {
        symmetricKey = await window.crypto.subtle.importKey(
            'raw',
            symmetricKey,
            'AES-CBC',
            true,
            ['decrypt', 'encrypt']
        );

        console.debug('[encryptSK] converting Uint8Array to CryptoKey!');
    }
    else if (!(symmetricKey instanceof CryptoKey)) {
        throw new TypeError('[encryptSK] symmetric key must be a CryptoKey or Uint8Array!');
    }

    return window.crypto.subtle.wrapKey(
        'raw',
        symmetricKey,
        masterKey,
        {
            name: 'AES-CBC',
            iv: IV
        }
    );
}

async function decryptVault(vaultIV, symmetricKey, encryptedVault) {
    if (!(vaultIV instanceof Uint8Array)) {
        throw new TypeError('[decryptVault] vaultIV must be a Uint8Array!');
    }
    if (!(symmetricKey instanceof CryptoKey)) {
        throw new TypeError('[decryptVault] symmetricKey must be a CryptoKey!');
    }
    if (!(encryptedVault instanceof Uint8Array)) {
        throw new TypeError('[decryptVault] encryptedVault must be a Uint8Array!');
    }

    return window.crypto.subtle.decrypt(
        {
            name: 'AES-CBC',
            iv: vaultIV
        },
        symmetricKey,
        encryptedVault
    );
}

async function encryptVault(vaultIV, symmetricKey, vault) {
    if (!(vaultIV instanceof Uint8Array)) {
        throw new TypeError('[encryptVault] vaultIV must be a Uint8Array!');
    }
    if (!(symmetricKey instanceof CryptoKey)) {
        throw new TypeError('[encryptVault] symmetricKey must be a CryptoKey!');
    }
    if (typeof vault !== 'string') {
        throw new TypeError('[encryptVault] vault must be a string!');
    }

    return window.crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv: vaultIV
        },
        symmetricKey,
        encoder.encode(vault)
    );
}


function fromHex(hex) {
    if (typeof hex !== 'string') {
        throw new TypeError('[fromHex] hex must be a string!');
    }

    return Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

function toHex(buffer) {
    if (buffer instanceof ArrayBuffer) {
        buffer = new Uint8Array(buffer);
    }
    else if (!(buffer instanceof Uint8Array)) {
        throw new TypeError('[toHex] buffer must be an ArrayBuffer or Uint8Array!');
    }

    let result = '';
    for (const byte of buffer) {
        result += byte.toString(16).padStart(2, '0');
    }

    return result;
}

export default {
    deriveMK, deriveMPH,
    decryptPSK, encryptSK,
    decryptVault, encryptVault,
    fromHex, toHex
};
