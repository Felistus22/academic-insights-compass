# Padre Pio Report Card

A comprehensive school management system built with React, TypeScript, and Supabase. Features student management, teacher administration, academic records, and report card generation.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm package manager

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
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

### Alternative Setup (automated)
```bash
chmod +x setup.sh
./setup.sh
```

## 📦 Available Scripts

- `npm run dev` - Start development server (frontend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 PWA Installation

This app is a Progressive Web App and can be installed on desktop and mobile devices:

### Desktop Installation
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click "Install Padre Pio Report Card"

### Mobile Installation
1. Open the app in your mobile browser
2. Tap the browser menu
3. Select "Add to Home Screen" or "Install App"

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Query, Context API
- **PWA**: Service Worker, Web App Manifest

### Features
- 📊 Student management and academic records
- 👨‍🏫 Teacher administration and subject assignments
- 📋 Exam management and grade entry
- 📄 Automated report card generation
- 🔐 Role-based authentication (Admin/Teacher)
- 📱 Progressive Web App with offline support
- 🌙 Dark/Light theme support
- 📊 Data visualization and reporting

## 🗄️ Database Schema

- `students` - Student profiles and information
- `teachers` - Teacher accounts and details
- `subjects` - Subject definitions and codes
- `exams` - Exam schedules and configurations
- `marks` - Student grades and assessments
- `teacher_subjects` - Subject assignments
- `activity_logs` - System audit trail

## 🔧 Development

### Project Structure
```
src/
├── components/         # Reusable UI components
├── pages/             # Route pages
├── contexts/          # React contexts
├── hooks/            # Custom hooks
├── services/         # API services
├── types/            # TypeScript definitions
└── integrations/     # Supabase setup
```

### Environment
The app is pre-configured with Supabase. No additional environment variables needed for development.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect repo and deploy automatically
- **Netlify**: Drag & drop the `dist` folder
- **GitHub Pages**: Enable in repository settings

## 📄 License

Proprietary software for Padre Pio School.

---

### Development Notes

**Lovable Integration**: This project was created with [Lovable](https://lovable.dev) and supports continuous deployment. Changes can be made through the Lovable editor or by pushing to the connected repository.
