
# User Authentication and Password Reset System

This project is a simple Node.js-based user authentication system with features like user registration, login, forgot password, and password reset. It uses MongoDB for data storage, bcrypt for password hashing, JWT for token-based authentication, and Nodemailer for sending password reset emails.


## Features

#User Registration: Allows users to register with a username, email, and password.

#User Login: Enables users to log in with their username and password, and receive a JWT token for subsequent authentication.

#Forgot Password: Users can request a password reset via email by providing their email address.

#Reset Password: After receiving a reset link via email, users can reset their password.


## Tech Stack

Node.js: Server-side JavaScript runtime.

Express: Web framework for Node.js.

MongoDB: NoSQL database for storing user data.

Mongoose: ODM (Object Document Mapping) for MongoDB.

bcryptjs: Library for password hashing.

jsonwebtoken: Library for creating and verifying JWT tokens.

Nodemailer: Library for sending emails (used for password reset).

dotenv: To manage environment variables like email credentials and JWT secret.
## Installation

Prerequisites

Node.js and npm installed on your machine.

Download and install Node.js from https://nodejs.org/.

MongoDB running locally or use a cloud-based MongoDB service.

Installation Steps

Clone the Repository:
bash
Copy code

git clone <repository_url>
cd <project_directory>

Install Dependencies:
bash
Copy code

npm install

Set Up Environment Variables:

Create a .env file in the root directory and add the following variables:

makefile

MY_EMAIL=your_email@gmail.com
MY_PASSWORD=your_email_password
JWT_SECRET=your_jwt_secret_key

Start MongoDB:
Ensure MongoDB is running on your machine (or use MongoDB Atlas for a cloud-based database).

Run the Server:

bash

node server.js
The server will start on http://localhost:3000.
## API Reference

#### Get all items

```http
  ### ->POST /register

  Request Body-> Using ThunderClient / Postman
{
  "username": "exampleUser",
  "email": "user@example.com",
  "password": "securePassword"
}


 ###->  POST /login

{
  "username": "exampleUser",
  "password": "securePassword"
}

### -> POST /forgot-password

Request a password reset link by providing the email. A reset link will be sent to the email.

Request Body:

{
  "email": "user@example.com"
}


### -> POST /reset-password

Reset the password using the reset token and new password.

Request Body:

{
  "token": "reset_token_received_from_email",
  "newPassword": "newSecurePassword"
}



## Usage/Examples

Register a new user:
Send a POST request to /register with the user details.

Login:
Send a POST request to /login with the username and password to get the JWT token.

Forgot Password:
Send a POST request to /forgot-password with the email to receive a reset link.

Reset Password:
Send a POST request to /reset-password with the reset token and new password to update the password.


## Lessons Learned

Make sure to keep your .env file safe and do not commit it to version control.

The JWT_SECRET used for signing JWT tokens should be a strong secret key.

Ensure your email service credentials (MY_EMAIL and MY_PASSWORD) are correctly set in the .env file.

