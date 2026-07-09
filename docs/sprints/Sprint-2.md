# Sprint 2 – Authentication & Authorization

## Objective
Build a secure authentication and authorization system for the SOP project using JWT, Role-Based Access Control (RBAC), and enterprise backend architecture.

## Tasks Completed
- Designed and implemented the User schema.
- Added password validation rules.
- Implemented password hashing using bcrypt.
- Added password comparison model method.
- Created User Repository following the Repository Pattern.
- Implemented Authentication Service.
- Implemented Authentication Controller.
- Created Authentication Routes.
- Implemented JWT Access Token generation.
- Configured JWT environment variables.
- Added centralized API response utility.
- Created roles and status constants.
- Implemented Authentication Middleware for protected routes.
- Implemented Authorization Middleware (RBAC).
- Created Super Admin Seeder.
- Seeded initial Super Admin account.
- Tested Login API using Thunder Client.
- Tested protected routes using JWT.
- Verified Role-Based Access Control.

## APIs Implemented
- POST /api/v1/auth/login
- GET /api/v1/health
- GET /api/v1/health/protected
- GET /api/v1/health/admin

## Deliverables
- Secure JWT-based authentication system.
- Role-Based Access Control (RBAC).
- Enterprise Repository-Service-Controller architecture.
- Password hashing and validation.
- Super Admin seeding.
- Protected API infrastructure.
- Standardized API responses.
- Successfully tested authentication workflow.

## Outcome
The backend now supports secure user authentication, JWT-based authorization, protected APIs, and role-based access control. The authentication module serves as the security foundation for all upcoming business modules, including Branch Management, User Management, Products, Inventory, Billing, and Reporting.