# PPSU App Setup Guide

PPSU App is a Next.js application built with TypeScript, Tailwind CSS, and Prisma ORM. It appears to be a reporting system for facility maintenance, allowing users to submit reports about damages, cleanliness issues, and other concerns.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) database
- [Prisma CLI](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project) (optional, included as dev dependency)

### Installing PostgreSQL

If you don't have PostgreSQL installed:

#### Windows
- Download from [PostgreSQL Official Site](https://www.postgresql.org/download/windows/)
- During installation, note down the password for the `postgres` user
- The default port is usually 5432

#### macOS
- Using Homebrew: `brew install postgresql`
- Start the service: `brew services start postgresql`

#### Linux (Ubuntu/Debian)
- Install packages: `sudo apt-get install postgresql postgresql-contrib`
- Start the service: `sudo systemctl start postgresql`
- Enable auto-start: `sudo systemctl enable postgresql`

After installation, make sure PostgreSQL is running before proceeding with the setup.

## Project Structure

```
ppsu-app/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Prisma schema definition
│   ├── migrations/         # Database migration files
│   └── seed/               # Seed data (if any)
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utility functions and configurations
│   └── middleware.ts       # Authentication and authorization middleware
├── .env.example           # Environment variables template
├── next.config.ts         # Next.js configuration
├── package.json           # Project dependencies and scripts
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ppsu-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ppsu_app_db"
DIRECT_URL="postgresql://username:password@localhost:5432/ppsu_app_db"

# JWT Secret for authentication
JWT_SECRET="your-jwt-secret-key-here"

# Cloudinary configuration (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Optional: Cookie configuration
NEXT_PUBLIC_COOKIE_NAME="ppsu_session"
COOKIE_SECRET="your-cookie-secret"
```

#### Database URL Format

The PostgreSQL connection string format is:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

For example, if your PostgreSQL is running locally with default settings:
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ppsu_app"
DIRECT_URL="postgresql://postgres:your_password@localhost:5432/ppsu_app"
```

Make sure to replace:
- `USERNAME`: Your PostgreSQL username (default is often `postgres`)
- `PASSWORD`: Your PostgreSQL password
- `HOST`: Your database host (usually `localhost` for local development)
- `PORT`: Your database port (default is `5432` for PostgreSQL)
- `DATABASE_NAME`: The name of your database (e.g., `ppsu_app`)

#### Important Note for Windows Users

If you encounter permission errors when running Prisma commands on Windows (such as EPERM errors), try the following:

1. Run your command prompt or terminal as Administrator
2. Make sure no other processes are using the Prisma client files
3. Close any IDEs or editors that might be accessing the project files
4. If still having issues, restart your computer and try again

### 4. Database Setup

#### Initialize the Database

First, make sure your PostgreSQL server is running and create a database for the application:

##### Creating the Database

Connect to PostgreSQL as superuser and create the database:

```bash
# Connect to PostgreSQL (Windows may require running as administrator)
psql -U postgres

# Inside PostgreSQL prompt, create the database
CREATE DATABASE ppsu_app;

# Grant privileges (optional but recommended)
GRANT ALL PRIVILEGES ON DATABASE ppsu_app TO postgres;

# Exit PostgreSQL prompt
\q
```

Alternatively, you can use pgAdmin or any other PostgreSQL client to create the database.

##### Apply Migrations

Run the following command to create and apply the initial database schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the PostgreSQL tables based on the schema in `prisma/schema.prisma`
- Generate the Prisma Client in `src/generated/prisma`

#### (Optional) Seed the Database

The project includes a seed script that creates test users for authentication testing. Run the following command to populate the database with sample data:

```bash
npx prisma db seed
```

This will create:
- An Admin user with credentials:
  - ID: `ADMIN001`
  - Password: `admin123`
- A Petugas user with credentials:
  - ID: `PETUGAS001`
  - Password: `petugas123`

### 5. Generate Prisma Client

Generate the Prisma Client to interact with the database:

```bash
npx prisma generate
```

### 6. Run the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production with Turbopack
- `npm run start` - Start the production server
- `npm run seed` - Seed the database with test users
- `npx prisma migrate dev` - Create and apply a new migration
- `npx prisma studio` - Open Prisma Studio to view/edit database records
- `npx prisma generate` - Generate Prisma Client

## Project Features

### Authentication & Authorization
- Role-based access control (Admin, Petugas)
- Protected routes via middleware
- Session management
- JWT-based authentication
- User registration and login functionality

### Database Models
- **User**: Stores user information with roles (ADMIN, PETUGAS)
- **Laporan**: Reports with status tracking (PENDING, DITERIMA, DITOLAK)
- **Enums**: UserRole, ReviewStatus, Bidang

### UI Components
- Built with Radix UI primitives
- Styled with Tailwind CSS
- Using shadcn/ui components
- Lucide React icons

### File Uploads
- Cloudinary integration for image storage
- Support for multiple image uploads per report

## Environment Configuration

### Database Configuration
The application uses PostgreSQL with Prisma ORM. Ensure your database is accessible and credentials are correctly configured in the environment variables.

### Authentication Configuration
JWT tokens are used for authentication. Configure the `JWT_SECRET` with a strong secret key.

### Image Upload Configuration
Cloudinary is used for storing uploaded images. Set up your Cloudinary account and configure the environment variables.

## Development Notes

### Adding New Pages
- Place new pages in the `src/app/` directory following the App Router convention
- Use the `@/` alias to reference files in the `src/` directory

### Component Library
- Reusable components are stored in `src/components/`
- UI components follow the shadcn/ui pattern
- Use `@/components` alias to import components

### Styling
- Tailwind CSS is used for styling
- Global styles are in `src/app/globals.css`
- Use `@/lib/utils` for utility functions like `cn` for class merging

### Database Operations
- Use Prisma Client for database operations
- Generated client is available in `src/generated/prisma`
- Define models in `prisma/schema.prisma`

## Deployment

### Environment Variables for Production
When deploying, ensure the following environment variables are set:
- `DATABASE_URL`: Production database connection string
- `DIRECT_URL`: Direct database connection string
- `JWT_SECRET`: JWT secret for authentication
- `NODE_ENV`: Set to "production"

### Build Process
The build process uses Next.js with Turbopack. Run `npm run build` to create an optimized production build.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify that PostgreSQL is running
   - Check that the database URL in `.env` is correct
   - Ensure the database exists and has proper permissions

2. **Invalid Port Number Error (P1013)**
   - Verify the port number in your DATABASE_URL is correct (default PostgreSQL port is 5432)
   - Make sure there are no extra characters or spaces in the URL
   - Example of correct format: `postgresql://username:password@localhost:5432/database_name`

3. **Prisma Client Generation Error (EPERM on Windows)**
   - Run your command prompt as Administrator
   - Close any IDEs or editors that might be accessing the project files
   - Make sure no other processes are using the Prisma client files
   - Try restarting your computer if the issue persists
   - Ensure your antivirus software isn't blocking file operations

4. **Environment Variables Not Loading**
   - Verify that `.env` file is in the root directory
   - Check that variable names match exactly

5. **Authentication Issues**
   - Ensure `JWT_SECRET` is properly configured
   - Check that session cookies are enabled in the browser

### Useful Commands

- View database records: `npx prisma studio`
- Create a new migration: `npx prisma migrate dev --name migration-name`
- Reset database: `npx prisma migrate reset`
- Format schema: `npx prisma format`

## Testing Authentication

### Creating Test Users

To test the authentication system, you'll need to create users in your database. You can do this programmatically or directly in the database.

#### Option 1: Using Prisma Studio (Recommended)

1. Run Prisma Studio to view and edit your database:
```bash
npx prisma studio
```

2. Navigate to the Users table and create a new user:
   - `id`: Will be auto-generated (UUID)
   - `role`: Either "ADMIN" or "PETUGAS"
   - `petugasId`: Unique identifier for the user (this is used for login)
   - `nama`: Full name of the user
   - `noTelp`: Phone number (optional)
   - `aktif`: Set to true to activate the account
   - `passwordHash`: Hash of the user's password (see below for how to generate)

#### Option 2: Programmatically via Script

Create a temporary script to seed users:

```javascript
// scripts/create-user.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  const passwordHash = await bcrypt.hash('your-test-password', 10);

  const user = await prisma.user.create({
    data: {
      role: 'PETUGAS', // or 'ADMIN'
      petugasId: 'TEST001',
      nama: 'Test User',
      noTelp: '+6281234567890',
      aktif: true,
      passwordHash: passwordHash,
    },
  });

  console.log('Created user:', user);
  await prisma.$disconnect();
}

createUser().catch(console.error);
```

Run the script:
```bash
node scripts/create-user.js
```

#### Password Hashing

Passwords need to be hashed before storing in the database. You can hash passwords using bcrypt:

```javascript
const bcrypt = require('bcrypt');

// Hash a password
const password = 'your-password';
const hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword);
```

### Authentication Endpoints

The application has the following authentication endpoints:

- `POST /api/auth/login` - User login (expects `petugasId` and `password`)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info (protected endpoint)

### Login Credentials

Users log in using their `petugasId` and password (not email or username).

### Testing Different User Roles

1. **Petugas (Staff) Role**:
   - Can access: Dashboard (`/`), History (`/riwayat`), Profile (`/profil`), Create Report (`/buat-laporan`)
   - Cannot access: Admin pages (`/admin`, `/laporan-admin`, `/petugas`)

2. **Admin Role**:
   - Can access: Admin dashboard (`/admin`), Report management (`/laporan-admin`), Staff management (`/petugas`)
   - Cannot access: Petugas pages (redirected to admin dashboard)

### Manual Testing Steps

1. Start your development server: `npm run dev`
2. Create a test user using one of the methods above
3. Navigate to the login page (`/login`)
4. Enter the `petugasId` and password for your test user
5. Verify that:
   - Login succeeds with correct credentials
   - Login fails with incorrect credentials
   - User is redirected to appropriate dashboard based on role (Admin → `/admin`, Petugas → `/`)
   - Protected routes require authentication
   - Role-based access restrictions work correctly
   - JWT token is stored in cookies (named `token`)
   - Logout functionality works correctly

### Testing API Endpoints

Once logged in, you can also test protected API endpoints:

1. After logging in, check that the `token` cookie is set in your browser
2. Access protected API endpoints like:
   - `GET /api/profil/data` - Get profile data
   - `GET /api/laporan` - Get reports
   - `GET /api/petugas/dashboard` - Get dashboard data
3. Verify that these endpoints return 401 Unauthorized when not logged in

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)