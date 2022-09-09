/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-undef */
import base64 from './base64.js';
import config from './config.js';
import cryptoUtils from './cryptoUtils.js';
import login from './login.js';
import signup from './signup.js';

async function decryptVault() {
    await cryptoUtils.decryptVault(
        cryptoUtils.fromHex(vaultIV.value),
        await window.crypto.subtle.importKey(
            'raw',
            cryptoUtils.fromHex(symmetricKeyEl.value),
            'AES-CBC',
            true,
            ['decrypt']
        ),
        base64.toByteArray(encryptedVaultEl.value)
    ).then((vault) => {
        const decoder = new TextDecoder();

        vaultEl.value = decoder.decode(vault);
    }).catch(err => console.dir(err));
}

async function encryptVault() {
    await cryptoUtils.encryptVault(
        cryptoUtils.fromHex(vaultIV.value),
        await window.crypto.subtle.importKey(
            'raw',
            cryptoUtils.fromHex(symmetricKeyEl.value),
            'AES-CBC',
            true,
            ['encrypt']
        ),
        vaultEl.value
    ).then((encryptedVault) => {
        encryptedVaultEl.value = base64.fromByteArray(new Uint8Array(encryptedVault));
    }).catch(err => console.dir(err));
}


const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const masterKeyEl = document.getElementById('masterKey');
const MPHEl = document.getElementById('masterPasswordHash');
const IVEl = document.getElementById('IV');
const PSKEl = document.getElementById('PSK');
const symmetricKeyEl = document.getElementById('symmetricKey');
const vaultIV = document.getElementById('vaultIV');
const encryptedVaultEl = document.getElementById('encryptedVault');
const vaultEl = document.getElementById('vault');


document.getElementById('login').addEventListener('click', login);
document.getElementById('signup').addEventListener('click', signup);
document.getElementById('decrypt').addEventListener('click', decryptVault);
document.getElementById('encrypt').addEventListener('click', encryptVault);
document.getElementById('randomVault').addEventListener('click', () => {
    vaultEl.value = window.crypto.randomUUID();
});


if (typeof config.email === 'string' && config.email) {
    emailEl.value = config.email;
}
if (typeof config.password === 'string' && config.password) {
    passwordEl.value = config.password;
}
if (typeof config.IV === 'string' && config.IV) {
    IVEl.value = config.IV;
}
if (typeof config.PSK === 'string' && config.PSK) {
    PSKEl.value = config.PSK;
}
if (typeof config.vaultIV === 'string' && config.vaultIV) {
    vaultIV.value = config.vaultIV;
}
if (typeof config.encryptedVault === 'string' && config.encryptedVault) {
    encryptedVaultEl.value = config.encryptedVault;
}
if (config.vault) {
    vaultEl.value = JSON.stringify(config.vault);
}


masterKeyEl.value = '';
MPHEl.value = '';
symmetricKeyEl.value = '';
encryptedVaultEl.value = '';

// const test = crypto.getRandomValues(new Uint8Array(16));
// const b64 = cryptoUtils.toB64(test);
// const decoded = cryptoUtils.fromB64(b64);

// console.log(test);
// console.log(b64);
// console.log(decoded);
