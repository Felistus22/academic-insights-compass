# Padre Pio Report Card - Setup Guide

A comprehensive school management system built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd padre-pio-report-card
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:8080`

### Alternative Setup (using setup script)
```bash
chmod +x setup.sh
./setup.sh
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components
│   ├── profile/        # Profile management
│   └── ui/            # Base UI components (shadcn/ui)
├── contexts/           # React contexts
├── hooks/             # Custom React hooks
├── integrations/      # Supabase integration
├── lib/              # Utility libraries
├── pages/            # Page components
├── services/         # Data services
└── types/            # TypeScript type definitions
```

## 🗄️ Database

The project uses Supabase as the backend service with the following tables:
- `students` - Student information
- `teachers` - Teacher information
- `subjects` - Subject definitions
- `exams` - Exam information
- `marks` - Student marks/grades
- `teacher_subjects` - Teacher-subject assignments
- `activity_logs` - System activity tracking

## 🔐 Authentication

The system includes role-based authentication:
- **Admin** - Full system access
- **Teacher** - Limited access to assigned subjects and students

## 📱 PWA Features

This app is a Progressive Web App (PWA) with:
- **Installable** - Can be installed on desktop and mobile devices
- **Offline Support** - Core functionality works without internet
- **Service Worker** - Caches resources for better performance
- **Responsive Design** - Works on all screen sizes

### Installing the PWA

#### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install Padre Pio Report Card"
3. The app will be added to your applications

#### Mobile (Chrome/Safari)
1. Open the app in your browser
2. Tap the share button
3. Select "Add to Home Screen"

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Query, React Context
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation

### Environment Variables
The app is pre-configured with Supabase credentials. No additional environment variables are required for basic functionality.

### Code Style
- ESLint for code linting
- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

The `dist` folder will contain the production-ready files.

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 📄 License

This project is proprietary software for Padre Pio School.

## 🆘 Support

For technical support or questions, please contact the development team.