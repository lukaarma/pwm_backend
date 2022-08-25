# Security whitepaper

## Client side

When a new account is created, PWM uses Password-Based Key Derivation Function 2 (PBKDF2-SHA512) with 100,000 iteration rounds
and a salt of the user's email to derive the 256 bit Master Key.
This Master Key is then expanded to 512 bit using HMAC-based Extract-and-Expand Key Derivation Function (HKDF) obtaining
the 512 bit Expanded Master Key.
Master Password, Master Key and Expanded Master Key are **NEVER** transmitted to or stored on our server, they are only
generated and used on the client.

To encrypt the credentials a 512 bit Symmetric Key and 128 bit Initialization Vector are generated using a
Cryptographically Secure Pseudorandom Number Generator (CSPRNG). The Symmetric Key is then encrypted using AES-256
encryption, the Initialization Vector and the Expanded Master Key to generate the Protected Symmetric Key. <br>
The Protected Symmetric Key is then sent to our server to be stored until a new client syncs and retrieves it.

A Master Password Hash is also created using PBKDF2-SHA512 with a salt of Master Password and a payload of Master Key.
This Master Password Hash is sent then to our server over HTTPS.

### SCHEMA

```mermaid
flowchart
    MASTER_PASSWORD[[Master Password]]
    MASTER_PASSWORD_HASH[Master Password Hash]
    MASTER_KEY["Master Key (256 bit)"]
    STRETCHED_MASTER_KEY["Expanded Master Key (512 bit)"]
    SYMMETRIC_KEY[512 bit Symmetric Key]
    IV[128 bit Initialization Vector]
    PROTECTED_SYMMETRIC_KEY[Protected Symmetric Key]

    CSPRNG[[CSPRNG]]
    PBKDF2_SHA512_KEY(PBKDF2-SHA512 <br> 100,000 iterations <br> SALT: User email <br> PAYLOAD: Master Password)
    PBKDF2_SHA512_HASH(PBKDF2-SHA512 <br> 1 iteration <br> SALT: Master Password <br> PAYLOAD: Master Key)
    HKDF(HKDF)
    AES_256(AES-256 bit encryption <br> KEY: Expanded Master Key <br> IV: Initialization Vector <br> PAYLOAD: Symmetric Key)
    HTTPS_TO_SERVER{{HTTPS to server}}


    MASTER_PASSWORD --> PBKDF2_SHA512_HASH --> MASTER_PASSWORD_HASH

    MASTER_PASSWORD --->  PBKDF2_SHA512_KEY --> MASTER_KEY
    MASTER_KEY --> HKDF --> STRETCHED_MASTER_KEY --> AES_256
    MASTER_KEY --> PBKDF2_SHA512_HASH

    CSPRNG ------> SYMMETRIC_KEY --> AES_256
    CSPRNG ------> IV --> AES_256
    AES_256 --> PROTECTED_SYMMETRIC_KEY

    MASTER_PASSWORD_HASH --> HTTPS_TO_SERVER
    PROTECTED_SYMMETRIC_KEY --> HTTPS_TO_SERVER
```

## Server side

We receive the Master Password Hash from the client over HTTPS and we hash it again using 12 rounds of Bcrypt and
a random salt saving the digest in our database to be used every time a user tries to authenticate.
The Protected Symmetric Key is also stored in our database to be synced with every new client that syncs with our servers.

```mermaid
flowchart
    MASTER_PASSWORD_HASH[Master Password Hash]
    PROTECTED_SYMMETRIC_KEY[Protected Symmetric Key]
    DATABASE[(<br> MongoDB Cluster)]
    HTTPS_FROM_CLIENT{{HTTPS from client}}

    BCRYPT(Bcrypt <br> 12 rounds <br> SALT: random <br> PAYLOAD: Master Password Hash)


    HTTPS_FROM_CLIENT --> MASTER_PASSWORD_HASH --> BCRYPT --> DATABASE
    HTTPS_FROM_CLIENT --> PROTECTED_SYMMETRIC_KEY --> DATABASE
```
