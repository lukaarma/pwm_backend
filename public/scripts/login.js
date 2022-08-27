/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import cryptoUtils from './cryptoUtils.js';


export default async function () {
    console.debug('[LOGIN] Start login sequence');

    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const masterKeyEl = document.getElementById('masterKey');
    const MPHEl = document.getElementById('masterPasswordHash');
    const symmetricKeyEl = document.getElementById('symmetricKey');


    return await cryptoUtils.deriveMK(emailEl.value, passwordEl.value).then(async (MK) => {
        masterKeyEl.value = cryptoUtils.toHex(await window.crypto.subtle.exportKey('raw', MK));

        console.debug('[LOGIN] Got Master Key, creating Master Password Hash');

        await cryptoUtils.deriveMPH(passwordEl.value, MK).then((MPH) => {
            console.debug('[LOGIN] Got Master Password Hash, login done.');
            MPHEl.value = cryptoUtils.toHex(MPH);

            console.debug('[LOGIN] Got PSK and IV');
        });

        console.debug('[LOGIN] Got PSK and IV');

        return await cryptoUtils.decryptPSK(
            cryptoUtils.fromHex(document.getElementById('IV').value),
            MK,
            cryptoUtils.fromHex(document.getElementById('PSK').value)
        ).then(async (symmetricKey) => {
            symmetricKeyEl.value = cryptoUtils.toHex(await window.crypto.subtle.exportKey('raw', symmetricKey));
            console.debug('[LOGIN] Got Symmetric Key');

            return symmetricKey;
        });
    }).catch((err) => {
        console.dir(err);
    });
}
