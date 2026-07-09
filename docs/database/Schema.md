# SOP Database Schema

Version: 1.0
Database: SOP_DB

---

# Collection: Users

## Purpose

Stores all system users who can access the SOP platform.

This includes:

- Super Administrators
- Branch Administrators
- Cashiers
- Inventory Managers (future)
- Managers (future)

This collection is responsible for authentication, authorization (RBAC), user profile management, account security, and audit ownership.

---

## Collection Name

users

---

## Fields

| Field | Data Type | Required | Unique | Default | Description |
|--------|----------|----------|---------|----------|-------------|
| fullName | String | Yes | No | - | User's full name |
| email | String | Yes | Yes | - | Login email |
| password | String | Yes | No | - | Hashed password using bcrypt |
| role | String (Enum) | Yes | No | CASHIER | User role |
| branchId | ObjectId | Yes* | No | null | Assigned branch |
| phone | String | No | No | null | Contact number |
| profileImage | String | No | No | null | Profile image URL |
| isActive | Boolean | Yes | No | true | Account active status |
| failedLoginAttempts | Number | Yes | No | 0 | Failed login count |
| accountLockedUntil | Date | No | No | null | Lock expiration time |
| lastLogin | Date | No | No | null | Last successful login |
| passwordChangedAt | Date | No | No | null | Last password update |
| createdBy | ObjectId | No | No | null | Admin who created account |
| updatedBy | ObjectId | No | No | null | Last updated by |
| isDeleted | Boolean | Yes | No | false | Soft delete flag |
| createdAt | Date | Auto | No | Current Time | Created timestamp |
| updatedAt | Date | Auto | No | Current Time | Updated timestamp |

---

## Role Enum

SUPER_ADMIN

BRANCH_ADMIN

CASHIER

---

## Relationships

Branch (1)

↓

Users (Many)

---

Users

↓

Orders

↓

Audit Logs

---

## Validation Rules

Email

- Must be unique
- Must follow email format

Password

- Minimum 8 characters
- Must be hashed using bcrypt
- Never stored in plain text

Phone

- Optional
- 10–15 digits

Role

Allowed values

- SUPER_ADMIN
- BRANCH_ADMIN
- CASHIER

---

## Indexes

Unique

email

Normal

branchId

role

isActive

---

## Security

Passwords are hashed using bcrypt.

JWT authentication is used.

Refresh tokens are stored in HTTP-only cookies.

Accounts are automatically locked after multiple failed login attempts.

Passwords are never returned in API responses.

---

## Notes

Every user belongs to one branch except the SUPER_ADMIN.

The SUPER_ADMIN has access to all branches.

Soft delete is used instead of permanently deleting users.