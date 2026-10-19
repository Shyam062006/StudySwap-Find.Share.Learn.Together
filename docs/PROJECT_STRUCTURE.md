# StudySwap — Project Structure

```
StudySwap/
│
├── package.json                    # Root: concurrently scripts (dev, build, test, seed, create-admin)
├── .gitignore                      # Excludes node_modules, .env, uploads
├── README.md                       # Comprehensive setup and usage guide
├── StudySwap.png                   # Official StudySwap logo
│
├── docs/
│   ├── ARCHITECTURE.md             # Mermaid flowcharts + architecture decisions
│   ├── API_DOCUMENTATION.md        # All REST API endpoints documented
│   ├── DATABASE_SCHEMA.md          # MongoDB collections + indexes
│   ├── TESTING_GUIDE.md            # Test instructions + manual checklist
│   └── PROJECT_STRUCTURE.md        # This file
│
├── studyswap-frontend-claude/      # React Frontend (Vite)
│   ├── public/
│   │   ├── StudySwap.png           # Official brand logo
│   │   ├── logo.svg                # Fallback SVG logo
│   │   └── favicon.svg             # Browser tab icon
│   ├── index.html                  # Vite entry point with Manrope & Inter fonts
│   ├── vite.config.js              # Vite server configuration (port 5173)
│   ├── package.json                # Frontend dependencies (React 18, React Router v6, Lucide)
│   ├── .env                        # VITE_API_URL=http://localhost:5000/api
│   ├── .env.example
│   └── src/
│       ├── main.jsx                # React DOM entry point
│       ├── App.jsx                 # Application router (Public, Student, Admin routes)
│       │
│       ├── styles/                 # Pure CSS styling (Red Noir aesthetic)
│       │   ├── variables.css       # Design tokens (colors, fonts, radius, shadows)
│       │   ├── global.css          # Resets, typography, utilities
│       │   ├── components.css      # Buttons, inputs, modals, cards, badges
│       │   ├── layout.css          # Navbar, sidebar, header, footer layouts
│       │   └── responsive.css      # Tablet and mobile breakpoints
│       │
│       ├── contexts/               # React Context providers
│       │   ├── AuthContext.jsx     # User auth session & cookie management
│       │   ├── ThemeContext.jsx    # Dark (default) / Light theme toggle
│       │   └── NotificationContext.jsx # Transient toast notifications
│       │
│       ├── layouts/                # Shared layout components
│       │   ├── PublicLayout.jsx    # Navbar + Outlet + Footer
│       │   ├── StudentLayout.jsx   # Sidebar + Header + MobileNav + Outlet
│       │   └── AdminLayout.jsx     # Admin Sidebar + Admin Header + Outlet
│       │
│       ├── components/
│       │   ├── ProtectedRoute.jsx  # Route guard for authenticated & admin roles
│       │   ├── common/             # Button, Input, Select, Modal, Loader, Skeleton, Toast, EmptyState
│       │   ├── layout/             # PublicNavbar, AppSidebar, AppHeader, AppFooter, MobileNavigation
│       │   └── resources/          # ResourceCard, ResourceGrid, ResourceFilters, ResourceSearch,
│       │                           # ResourceUploadForm, RatingStars, ReviewList
│       │
│       ├── pages/
│       │   ├── public/             # LandingPage, AboutPage, NotFoundPage
│       │   ├── auth/               # LoginPage, RegisterPage, ForgotPasswordPage
│       │   ├── student/            # DashboardPage, MaterialHubPage, ResourceDetailsPage,
│       │   │                       # UploadMaterialPage, MyUploadsPage, SavedMaterialsPage,
│       │   │                       # LeaderboardPage, NotificationsPage, ProfilePage, SettingsPage
│       │   └── admin/              # AdminDashboardPage, ResourceModerationPage,
│       │                           # ReportManagementPage, UserManagementPage
│       │
│       ├── services/               # Centralized API network modules
│       │   ├── api.js              # Native fetch client with credentials: 'include'
│       │   ├── authService.js      # Register, login, logout, me
│       │   ├── resourceService.js  # Material Hub search, upload, download, delete
│       │   ├── bookmarkService.js  # Add, remove, list saved resources
│       │   ├── ratingService.js    # Rate resources, add/edit/delete reviews
│       │   ├── reportService.js    # Submit resource reports, admin moderation & stats
│       │   ├── notificationService.js # List notifications, mark read
│       │   └── userService.js      # Student profile, leaderboard, health
│       │
│       └── utils/                  # Formatting, constants, and validation rules
│
└── server/                         # Node.js + Express.js Backend
    ├── package.json                # Backend dependencies (express, mongodb, bcryptjs, jwt, multer)
    ├── .env                        # Server configuration (PORT, MONGODB_URI, JWT_SECRET)
    ├── .env.example
    ├── uploads/                    # Local storage for uploaded files (.gitkeep)
    ├── scripts/
    │   ├── createAdmin.js          # Interactive/CLI admin creation script
    │   └── seed.js                 # Database seeder with sample academic resources
    ├── tests/
    │   ├── setup.js                # Test DB runner (mongodb-memory-server)
    │   ├── auth.test.js            # Authentication API integration tests
    │   ├── resources.test.js       # Material Hub & upload integration tests
    │   ├── bookmarks.test.js       # Bookmarks integration tests
    │   └── admin.test.js           # Admin moderation & user management tests
    └── src/
        ├── server.js               # Database connection and HTTP server listener
        ├── app.js                  # Express middleware, CORS, Helmet, routes, error handlers
        ├── config/
        │   ├── database.js         # MongoDB native driver client singleton
        │   └── environment.js      # Central environment variable parser
        ├── controllers/            # Business logic handlers
        │   ├── authController.js
        │   ├── resourceController.js
        │   ├── bookmarkController.js
        │   ├── ratingController.js
        │   ├── reviewController.js
        │   ├── reportController.js
        │   ├── notificationController.js
        │   ├── leaderboardController.js
        │   ├── userController.js
        │   └── adminController.js
        ├── middleware/             # Express middlewares (auth, role, multer, errors, rate limits)
        ├── models/                 # MongoDB collections data access functions
        ├── routes/                 # Express route definitions
        ├── services/               # Storage, contribution points, notifications
        ├── utils/                  # ApiError, ApiResponse, generateToken, safeFileName
        └── validators/             # express-validator chains
```
