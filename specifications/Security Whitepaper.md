# Security whitepaper

## Client side

When a new account is created, PWM uses Password-Based Key Derivation Function 2 (PBKDF2-SHA512) with 120,000 iteration rounds
and a salt of the user's email to derive the 256 bit Master Key.

A Master Password Hash is also created using PBKDF2-SHA512 with a salt of Master Password and a payload of Master Key.
This Master Password Hash is sent then to our server over HTTPS.

Then a 256 bit Symmetric Key and 128 bit Initialization Vector (IV) are generated using a
Cryptographically Secure Pseudorandom Number Generator (CSPRNG).
The Symmetric key is encrypted with AES-256-CBC bit encryption using the Master Key and the Initialization Vector,
resulting in the Protected Symmetric Key.
The Protected Symmetric Key the Initialization Vector are then sent to our server to be stored until a new client syncs
and retrieves them.

To encrypt the Credential Vault we use AES-256-CBC with the Symmetric key and another 128 bit Vault IV, generated using
a CSPRNG.
The resulting Encrypted Vault and Vault IV are then sent back to our server for save storage until a new client
syncs and retrieves them.

Master Password, Master Key, Symmetric Key and the Credential Vault are **NEVER** transmitted to or stored on our server,
they are only generated and used on the client, so that no one, even us, can ever decrypt and access your credentials except
you.

### SYMMETRIC KEY SECURITY SCHEMA

```mermaid
flowchart
    MASTER_PASSWORD[["Master Password"]]
    MASTER_PASSWORD_HASH["Master Password Hash (576 bit)"]
    MASTER_KEY["Master Key (256 bit)"]
    SYMMETRIC_KEY["Symmetric key (256 bit)"]
    IV["Initialization Vector (128 bit)"]
    PROTECTED_SYMMETRIC_KEY["Protected Symmetric Key (384 bit)"]

    CSPRNG[[CSPRNG]]
    PBKDF2_SHA512_KEY(PBKDF2-SHA512 <br> 120,000 iterations <br> SALT: User email <br> PAYLOAD: Master Password)
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
    CSPRNG[[CSPRNG]]
    SYMMETRIC_KEY["Symmetric key (256 bit)"]
    VAULT_IV["Vault IV (128 bit)"]
    ENCRYPTED_VAULT[Encrypted Vault]
    HTTPS_TO_SERVER{{HTTPS to server}}

    AES_256_KEY("AES-256-CBC with PKCS7 padding <br> KEY: Symmetric Key <br> IV: Vault IV <br> PAYLOAD: Vault")

    CSPRNG --> VAULT_IV --> AES_256_KEY
    SYMMETRIC_KEY --> AES_256_KEY
    VAULT --> AES_256_KEY

    VAULT_IV --> HTTPS_TO_SERVER
    AES_256_KEY --> ENCRYPTED_VAULT --> HTTPS_TO_SERVER
```

## Server side

We receive the Master Password Hash from the client over HTTPS and we hash it again using 12 rounds of Bcrypt and
a random salt saving the digest in our database to be used every time a user tries to authenticate.

The Protected Symmetric Key and corresponding IV are stored together in the same collection in our MongoDB database to
be sent to every client that syncs with our servers.

The Encrypted Vault and corresponding IV are stored together in the another collection in our MongoDB database as a
backup copy of the local database in our client and to be sent when our it first syncs with our servers.

### DATABASE SECURITY SCHEMA

```mermaid
flowchart LR
    MASTER_PASSWORD_HASH[Master Password Hash]
    PROTECTED_SYMMETRIC_KEY[Protected Symmetric Key]
    IV["Initialization Vector (128 bit)"]
    PSK_COLLECTION[ProtectedSymmetricKeys]
    ENCRYPTED_VAULT[Encrypted Vault]
    VAULT_IV["Vault IV (128 bit)"]
    VAULT_COLLECTION[Vaults]
    DATABASE[(<br> MongoDB Cluster)]

    HTTPS_FROM_CLIENT{{HTTPS from client}}
    BCRYPT(Bcrypt <br> 12 rounds <br> SALT: random <br> PAYLOAD: Master Password Hash)


    HTTPS_FROM_CLIENT --> MASTER_PASSWORD_HASH --> BCRYPT --> DATABASE
    HTTPS_FROM_CLIENT --> PROTECTED_SYMMETRIC_KEY --> PSK_COLLECTION
    HTTPS_FROM_CLIENT --> IV --> PSK_COLLECTION
    HTTPS_FROM_CLIENT --> ENCRYPTED_VAULT --> VAULT_COLLECTION
    HTTPS_FROM_CLIENT --> VAULT_IV --> VAULT_COLLECTION

    PSK_COLLECTION --> DATABASE
    VAULT_COLLECTION --> DATABASE
```
