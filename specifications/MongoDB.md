# MONGODB TABLES SCHEMA

## LEGEND

➡️ Required <br>
⚙️ Field added automatically <br>

## USER

- ➡️ `email: string` → UNIQUE, server side validation before account activation, not updatable (for now)
- ➡️ `password: string` → stored as bcrypt hash. Min length 10, min 1 lowercase, 1 uppercase, 1 number, 1 [ @ $ ! % * ? & ]
- ➡️ `firstName: string` → allowed lowercase, uppercase, single/multiple names with space and single quote
- ➡️ `lastName: string` → allowed lowercase, uppercase, single/multiple names with space and single quote
- ⚙️ `createdAt: datetime`
- ⚙️ `updatedAt: datetime`
- ⚙️ `_id: MongoDB unique id`
