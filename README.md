# Travel Agency Platform

A full-stack travel agency platform built with Next.js, Express, and MongoDB. This application allows users to browse and book travel packages, while providing administrators with tools to manage packages and monitor bookings.

## Features

### User Features
- Browse available travel packages
- Search and filter packages by price and keywords
- View package details including pricing and available dates
- Make bookings with multiple travelers
- Responsive image loading with fallbacks

### Admin Features
- Secure admin dashboard with basic authentication
- Comprehensive analytics (total revenue, average booking value, popular packages)
- CRUD operations for travel packages
- Image upload and management for packages
- View and manage bookings
- Monitor booking statistics
- Pagination for package listing

## Tech Stack

### Frontend
- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios for API calls
- PDF-lib for invoice generation

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- Multer for file uploads
- Basic Authentication
- CORS enabled

## Project Structure
```
client/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── page.tsx
│   ├── components/
│   ├── types/
├── public/
├── package.json
└── ...
server/
├── models/
├── routes/
├── controllers/
├── middleware/
├── config/
├── server.js
├── package.json
└── ...
```

### Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance
- npm

### Environment Variables

#### Backend (.env)
Create a `.env` file in the `server` directory with the following variables:

MONGODB_URI=<your_mongodb_connection_string>
PORT=<your_port_number>


### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```

2. **Install dependencies for the server:**
   ```bash
   cd server
   npm install
   ```

3. **Install dependencies for the client:**
   ```bash
   cd client
   npm install
   ```

### Running the Application

1. **Start the MongoDB server** (if not already running).

2. **Run the backend server:**
   ```bash
   cd server
   npm start
   ```

3. **Run the frontend application:**
   ```bash
   cd client
   npm run dev
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:3000` for the frontend and `http://localhost:5000` for the backend API.

## API Endpoints

- **BASE_URL** : `http://localhost:<port_number>/api`

### Packages
- **GET** `/packages`: Retrieve all packages.
- **GET** `/packages/:id`: Retrieve a specific package by ID.
- **POST** `/packages`: Create a new package (Admin only).
- **PUT** `/packages/:id`: Update a package by ID (Admin only).
- **DELETE** `/packages/:id`: Delete a package by ID (Admin only).

### Bookings
- **GET** `/bookings`: Retrieve all bookings (Admin only).
- **POST** `/bookings`: Create a new booking.

## Contributing
Feel free to submit issues or pull requests for any improvements or features you'd like to see!

## Thank You
Thank you for using my project! If you have any questions or feedback, please feel free to reach out to me at `rishabhgupta4523@gmail.com`.

Happy coding!