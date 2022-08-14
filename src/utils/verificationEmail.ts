import logger from 'winston';


// TODO: add checks for email fail

const url = `https://api${process.env.MAILGUN_EU ? '.eu' : ''}.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;
const headers = new Headers({
    Authorization: `Basic ${Buffer.from(process.env.MAILGUN_USERNAME + ':' + process.env.MAILGUN_PASSWORD).toString('base64')}`
});

export default async function sendVerificationEmail(email: string, token: string): Promise<void> {
    logger.verbose(`Sending email verification token '${token}' to '${email}'`);

    await sendMail(
        email,
        'Please verify your PWM account',
        `Please use the following link to verify your account: https://dev.lukaarma.dynu.net/api/user/verify/${token}`
    );
}

async function sendMail(email: string, subject: string, body: string): Promise<void> {
    logger.debug(`Sending email to '${email}':\nSubject: '${subject}'\n${body}`);

    const form = new FormData();

    form.append('from', `Support <support@${process.env.MAILGUN_DOMAIN}>`);
    form.append('to', email);
    form.append('subject', subject);
    form.append('text', body);

    await fetch(url, {
        method: 'POST',
        headers: headers,
        body: form
    }).then(async (res) => logger.debug('[SEND_EMAIL] ' + await res.text())
    ).catch((err: Error) => logger.error({ message: err }));
}
