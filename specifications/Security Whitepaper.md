# Security whitepaper

## Client side

When a new account is created, PWM uses Password-Based Key Derivation Function 2 (PBKDF2-SHA512) with 100,000 iteration rounds
and a salt of the user's email to derive the 256 bit Master Key.
This Master Key is then expanded to 512 bit using HMAC-based Extract-and-Expand Key Derivation Function (HKDF) obtaining
the 256 bit Protection Master Key. <br>
Master Password, Master Key and Expanded Master Key are **NEVER** transmitted to or stored on our server, they are only
generated and used on the client.

To encrypt the credentials a 384 bit Symmetric Key and 128 bit Initialization Vector are generated using a
Cryptographically Secure Pseudorandom Number Generator (CSPRNG). The Symmetric Key is then encrypted using AES-256
encryption, the Initialization Vector and the Expanded Master Key to generate the Protected Symmetric Key. <br>
The 384 bit Symmetric Key is itself composed of a 256 bit Credentials Key and corresponding 128 bit Credentials IV that
are used in AES-256 encryption to encrypt the credentials vault.<br>
The Encrypted Vault is then uploaded to our servers
The Protected Symmetric Key the Initialization Vector and the Encrypted Vault are then sent to our server to be stored
until a new client syncs and retrieves them. <br>
The Symmetric Key or the Vault are **NEVER** transmitted to or stored on our server, they are only
generated and used on the client.

A Master Password Hash is also created using PBKDF2-SHA512 with a salt of Master Password and a payload of Master Key.
This Master Password Hash is sent then to our server over HTTPS.

### SYMMETRIC KEY SECURITY SCHEMA

```mermaid
flowchart
    MASTER_PASSWORD[["Master Password"]]
    MASTER_PASSWORD_HASH["Master Password Hash (576 bit)"]
    MASTER_KEY["Master Key (256 bit)"]
    SYMMETRIC_KEY["Symmetric key (384 bit)<br> [Credentials Key (256 bit) + Credentials IV (128 bit)]"]
    IV["Initialization Vector (128 bit)"]
    PROTECTED_SYMMETRIC_KEY["Protected Symmetric Key (384 bit)"]

    CSPRNG[[CSPRNG]]
    PBKDF2_SHA512_KEY(PBKDF2-SHA512 <br> 100,000 iterations <br> SALT: User email <br> PAYLOAD: Master Password)
    PBKDF2_SHA512_HASH(PBKDF2-SHA512 <br> 1 iteration <br> SALT: Master Password <br> PAYLOAD: Master Key)
    AES_256_KEY(AES-256-CBC with PKCS7 padding <br> KEY: Master Key <br> IV: Initialization Vector <br> PAYLOAD: Symmetric Key)
    HTTPS_TO_SERVER{{HTTPS to server}}


    MASTER_PASSWORD --> PBKDF2_SHA512_HASH ----> MASTER_PASSWORD_HASH

    MASTER_PASSWORD -->  PBKDF2_SHA512_KEY --> MASTER_KEY
    MASTER_KEY --> AES_256_KEY
    MASTER_KEY --> PBKDF2_SHA512_HASH

    CSPRNG -----> SYMMETRIC_KEY --> AES_256_KEY
    CSPRNG -----> IV --> AES_256_KEY

    AES_256_KEY --> PROTECTED_SYMMETRIC_KEY

    MASTER_PASSWORD_HASH --> HTTPS_TO_SERVER
    PROTECTED_SYMMETRIC_KEY --> HTTPS_TO_SERVER
    IV --> HTTPS_TO_SERVER
```

### VAULT SECURITY SCHEMA

```mermaid
flowchart LR
    VAULT[[Vault]]
    SYMMETRIC_KEY["Symmetric key (384 bit)<br> [Credentials Key (256 bit) + Credentials IV (128 bit)]"]
    ENCRYPTED_VAULT[[ENCRYPTED VAULT]]
    HTTPS_TO_SERVER{{HTTPS to server}}

    AES_256_KEY("AES-256-CBC with PKCS7 padding <br> KEY: Credentials Key <br> IV: Credentials IV <br> PAYLOAD: Vault")


    VAULT --> AES_256_KEY
    SYMMETRIC_KEY --> AES_256_KEY
    AES_256_KEY --> ENCRYPTED_VAULT --> HTTPS_TO_SERVER
```

## Server side

We receive the Master Password Hash from the client over HTTPS and we hash it again using 12 rounds of Bcrypt and
a random salt saving the digest in our database to be used every time a user tries to authenticate.
The Protected Symmetric Key and the Encrypted Vault are also stored in our database to be sent to every client
that syncs with our servers.

### DATABASE SECURITY SCHEMA

```mermaid
flowchart LR
    MASTER_PASSWORD_HASH[Master Password Hash]
    PROTECTED_SYMMETRIC_KEY[Protected Symmetric Key]
    DATABASE[(<br> MongoDB Cluster)]
    ENCRYPTED_VAULT[ENCRYPTED VAULT]
    HTTPS_FROM_CLIENT{{HTTPS from client}}

    BCRYPT(Bcrypt <br> 12 rounds <br> SALT: random <br> PAYLOAD: Master Password Hash)


    HTTPS_FROM_CLIENT --> MASTER_PASSWORD_HASH --> BCRYPT --> DATABASE
    HTTPS_FROM_CLIENT --> PROTECTED_SYMMETRIC_KEY ---> DATABASE
    HTTPS_FROM_CLIENT --> ENCRYPTED_VAULT ---> DATABASE
```
