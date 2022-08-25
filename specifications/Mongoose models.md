# Mongoose models

## LEGEND

✅ Required <br>
❌ Not required <br>
⚙️ Property added automatically

## USER

Stored in the 'UsersVerification' collection until verified, then moved to the 'Users' collection, where all
authentication and profile management occurs <br>
When stored in the 'UsersVerification' collection entries are deleted 4h after the last update

### SCHEMA

| Property name | Type | Required | Unique | Description |
| :-----------: | ---- | :------: | :------: | ------------ |
| email | String | ✅ | ✅ | Server side validation before account activation. Not updatable (for now) |
| masterPasswordHash | String | ✅ | ❌ | Stored as bcrypt hash. |
| firstName | String | ✅ | ❌ | Allowed lowercase, uppercase, single/multiple names with space and single quote |
| lastName | String | ✅ | ❌ | Allowed lowercase, uppercase, single/multiple names with space and single quote |
| createdAt | Date | ⚙️ | ❌ | Initialized at creation, never updated |
| updatedAt | Date | ⚙️ | ❌ | Updated each time the document is updated |
| _id | ObjectId | ⚙️ | ✅ | MongoDB ObjectId, saved in JWT token to identify users |

## VERIFICATION TOKEN

Stored in the 'VerificationTokens' collection, deleted when validation occurs or after 4h without use

### SCHEMA

| Property name | Type | Required | Unique | Description |
| :-----------: | ---- | :------: | :------: | ------------ |
| token | String | ✅ | ✅ | Generated as UUID V4 |
| userId | ObjectId | ✅ | ✅ | Reference to the user to activate. One token per user, new one replace old one |
| createdAt | Date | ⚙️ | ❌ | Initialized at creation, never updated, used to delete after 4h if not verified |
| _id | ObjectId | ⚙️ | ✅ | MongoDB ObjectId |

## PROTECTED SYMMETRIC KEY

Stored in the 'ProtectedSymmetricKeys'

### SCHEMA

| Property name | Type | Required | Unique | Description |
| :-----------: | ---- | :------: | :------: | ------------ |
| userId | ObjectId | ✅ | ✅ | Reference to the user to activate. One token per user, new one replace old one |
| key | String | ✅ | ❌ | Symmetric Key encrypted/decrypted on client using AES-256, encoded as base64 |
| IV | String | ✅ | ❌ | Initialization Vector sent to the client for AES-256 decription, encoded as base64 |
| createdAt | Date | ⚙️ | ❌ | Initialized at creation, never updated |
| updatedAt | Date | ⚙️ | ❌ | Updated each time the document is updated |
| _id | ObjectId | ⚙️ | ✅ | MongoDB ObjectId |
