# Agarly Backend

This is the backend service for the Agarly application, built with Spring Boot. It handles user authentication (Local & Google), user management, and email verification.

## 🛠️ Tech Stack

- **Java**: 25
- **Framework**: Spring Boot 4.0.0
- **Database**: PostgreSQL
- **Security**: Spring Security, JWT (JSON Web Tokens), Google OAuth2
- **Build Tool**: Maven

## 💾 Database Integration

The application uses **PostgreSQL** as its primary data store, integrated via **Spring Data JPA**.

- **ORM**: Hibernate is used for Object-Relational Mapping.
- **Connection**: Configured via `HikariCP` for efficient connection pooling.
- **Schema Management**: `spring.jpa.hibernate.ddl-auto` is configured for schema handling (currently `create-drop` for development).

### Configuration
The database connection is defined in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
```

## ✨ Key Features

- **User Authentication**:
  - **Local Login**: Email/Password authentication with BCrypt hashing.
  - **Google Login**: OAuth2 integration verifying Google ID Tokens.
  - **JWT**: Stateless authentication using Bearer tokens.
- **User Registration**:
  - Sign up with Email/Password.
  - **Email Verification**: Sends verification emails via SMTP (Gmail).
  - Automatic account creation for new Google users.
- **User Management**:
  - Retrieve user details by username or email.
  - Profile management (FirstName, LastName, Address, Phone).

## 🚀 Setup & Configuration

### Prerequisites
- Java 25 SDK
- PostgreSQL Database
- Maven

### Configuration (`application.properties`)

Configure the following properties in `src/main/resources/application.properties`:

**Google OAuth2**:
```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
```

**Mail Server (Gmail)**:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## 🔌 API Endpoints

### Authentication (`/account`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/account/register` | Register a new user. Sends verification email. | ❌ No |
| `POST` | `/account/login` | Login with Email & Password. Returns JWT. | ❌ No |
| `POST` | `/account/gAuth` | Login with Google ID Token. Returns JWT. | ❌ No |

### Users (`/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/username/{username}` | Get user details by username. | ❌ No (Public) |
| `GET` | `/users/email/{email}` | Get user details by email. | ❌ No (Public) |

## 🔒 Security

- **Public Routes**: Login, Register, Google Auth, User Lookup.
- **Protected Routes**: All other routes require a valid JWT in the `Authorization` header (`Bearer <token>`).
- **Password Storage**: Passwords are hashed using `BCryptPasswordEncoder` (strength 12).
