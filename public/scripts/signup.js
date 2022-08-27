/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import cryptoUtils from './cryptoUtils.js';


export default async function () {
    console.debug('[SIGNUP] Start signup sequence');

    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const masterKeyEl = document.getElementById('masterKey');
    const MPHEl = document.getElementById('masterPasswordHash');
    const IVEl = document.getElementById('IV');
    const PSKEl = document.getElementById('PSK');
    const symmetricKeyEl = document.getElementById('symmetricKey');
    const vaultIVEl = document.getElementById('vaultIV');
    const encryptedVaultEl = document.getElementById('encryptedVault');
    const vaultEl = document.getElementById('vault');

    encryptedVaultEl.value = '';
    vaultEl.value = '';
    PSKEl.value = '';

    const IV = window.crypto.getRandomValues(new Uint8Array(16));
    IVEl.value = cryptoUtils.toHex(IV);
    const symmetricKey = window.crypto.getRandomValues(new Uint8Array(32));
    symmetricKeyEl.value = cryptoUtils.toHex(symmetricKey);
    const vaultIV = window.crypto.getRandomValues(new Uint8Array(16));
    vaultIVEl.value = cryptoUtils.toHex(vaultIV);


    return await cryptoUtils.deriveMK(emailEl.value, passwordEl.value).then(async (MK) => {
        masterKeyEl.value = cryptoUtils.toHex(await window.crypto.subtle.exportKey('raw', MK));

        console.debug('[SIGNUP] Created Master Key, creating Master Password Hash');

        await cryptoUtils.deriveMPH(passwordEl.value, MK).then((MPH) => {
            console.debug('[SIGNUP] Created Master Password Hash.');
            MPHEl.value = cryptoUtils.toHex(MPH);
        });

        return await cryptoUtils.encryptSK(IV, MK, symmetricKey).then((PSK) => {
            PSKEl.value = cryptoUtils.toHex(PSK);
            console.debug('[SIGNUP] Created Protected Symmetric Key');

            return PSK;
        });
    }).catch((err) => {
        console.dir(err);
    });
}
