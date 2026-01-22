# STOD Demo Application

A modern web application for managing Standard Operating Procedures and Principles (STOD) with role-based access control.

## Features

- **User Authentication**: Login system with multiple user roles
- **Role-Based Access Control**: 
  - **Administrator**: Full access including user management
  - **Manager**: Can edit and delete principles
  - **Editor**: Can create and edit principles
  - **Viewer**: Read-only access
- **Principles Repository**: Create, view, edit, and delete STOD principles
- **User Management**: Administrators can manage users and their roles
- **Search Functionality**: Search principles by title, description, or category
- **Modern UI**: Built with Next.js, React, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

- **Admin**: `admin` / `admin123`
- **Moderator**: `moderator` / `moderator123`
- **Contributor**: `contributor` / `contributor123`
- **Practitioner**: `practitioner` / `practitioner123`
- **Member**: `member` / `member123`
- **Looker**: `looker` / `looker123`

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── Dashboard.tsx       # Main dashboard
│   ├── LoginForm.tsx       # Login component
│   ├── PrincipleCard.tsx   # Principle card component
│   ├── PrincipleModal.tsx  # Principle form modal
│   └── UserManagement.tsx  # User management interface
└── ref docs/               # Reference documentation
```

## Technologies Used

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Icons**: Icon library

## Data Storage

The application uses browser localStorage for data persistence. In a production environment, this would be replaced with a proper backend database.

## License

This is a demo application for demonstration purposes.

