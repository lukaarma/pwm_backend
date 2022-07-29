# MONGODB TABLES SCHEMA

## LEGEND

➡️ Required <br>
⚙️ Field added automatically <br>

## USER

- ➡️ `firstName: string` → allowed lowercase, uppercase, single/multiple names with space and single quote
- ➡️ `lastName: string` → allowed lowercase, uppercase, single/multiple names with space and single quote
- ➡️ `email: string` → UNIQUE, server side validation before account activation
- ➡️ `password: string` → min length 8, min 1 lowercase, 1 uppercase, 1 number, 1 [ @ $ ! % * ? & ]
- ⚙️ `creationDate: datetime`
- ⚙️ `UUID: MongoDB unique id`
