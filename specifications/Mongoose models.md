# Mongoose models

## LEGEND

✅ Required <br>
❌ Not required <br>
⚙️ Property added automatically

## USER

Stored in the 'usersVerification' collection until verified, then moved to the 'users' collection

### SCHEMA

| Property name | Type | Required | Unique | Description |
| :-----------: | ---- | :------: | :------: | ------------ |
| email | String | ✅ | ✅ | Server side validation before account activation. Not updatable (for now) |
| password | String | ✅ | ❌ | Stored as bcrypt hash.<br>Min length 10, 1 lower, 1 upper, 1 number, 1 symbol [@$!%*?&] |
| firstName | String | ✅ | ❌ | Allowed lowercase, uppercase, single/multiple names with space and single quote |
| lastName | String | ✅ | ❌ | Allowed lowercase, uppercase, single/multiple names with space and single quote |
| createdAt | Date | ⚙️ | ❌ | Initialized at creation, never updated |
| updatedAt | Date | ⚙️ | ❌ | Updated each time the document is updated |
| _id | ObjectId | ⚙️ | ✅ | MongoDB ObjectId, saved in JWT token to identify users |

## VERIFICATION TOKEN

Stored in the 'verificationTokens' collection, deleted when validation occurs or after 4h without use

### SCHEMA

| Property name | Type | Required | Unique | Description |
| :-----------: | ---- | :------: | :------: | ------------ |
| token | String | ✅ | ✅ | Generated as UUID V4 |
| userId | ObjectId | ✅ | ✅ | Reference to the user to activate. One token per user, new one replace old one |
| createdAt | Date | ⚙️ | ❌ | Initialized at creation, never updated, used to delete after 4h if not verified |
| _id | ObjectId | ⚙️ | ✅ | MongoDB ObjectId |
