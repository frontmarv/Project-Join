# Join - Kanban Project Management Tool

A collaborative task management application built with vanilla JavaScript, featuring drag-and-drop functionality, contact management, and real-time data synchronization with Firebase.

## 🚀 Features

- **Task Management**: Create, edit, and organize tasks with priorities, due dates, and subtasks
- **Kanban Board**: Drag-and-drop interface for managing task workflow (To Do, In Progress, Awaiting Feedback, Done)
- **Contact Management**: Add, edit, and delete contacts with profile images and contact details
- **User Authentication**: Secure login system with guest access option
- **Responsive Design**: Fully responsive layout optimized for desktop, tablet, and mobile devices
- **Real-time Sync**: Firebase Realtime Database integration for data persistence

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Features Details](#features-details)
- [Browser Compatibility](#browser-compatibility)
- [Contributing](#contributing)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/join.git
cd join
```

2. Open the project:
   - Simply open `index.html` in your browser, or
   - Use a local development server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

3. Navigate to `http://localhost:8000` (or your server's address)

## 💻 Usage

### Login
- Use the login form with your credentials
- Or click "Guest Login" for immediate access without registration

### Dashboard (Summary)
- View task statistics and upcoming deadlines
- See personalized greeting based on time of day

### Board
- Drag and drop tasks between columns
- Click tasks to view details or edit
- Filter tasks by search term
- Add new tasks with the "+" button

### Add Task
- Fill in task details (title, description, due date)
- Assign contacts to tasks
- Set priority (low, medium, high)
- Choose category (User Story or Technical Task)
- Add subtasks for detailed tracking

### Contacts
- View all contacts in alphabetical sections
- Add new contacts with profile colors
- Edit existing contact information
- Delete contacts (with confirmation)
- Mobile-responsive contact details view

## 📁 Project Structure

```
Project_Join/
├── index.html                 # Login page
├── script.js                  # Global utilities and Firebase config
├── pages/
│   ├── summary.html          # Dashboard overview
│   ├── board.html            # Kanban board
│   ├── add-task.html         # Task creation form
│   ├── contacts.html         # Contact management
│   ├── sign-up.html          # User registration
│   └── help.html             # Help documentation
├── scripts/
│   ├── authentication.js     # Login verification
│   ├── contacts.js           # Contact CRUD operations
│   ├── dlgs-contact.js       # Contact dialog management
│   ├── drag-and-drop.js      # Board drag-and-drop functionality
│   ├── login.js              # Login page logic
│   ├── navigation.js         # Responsive navigation
│   └── summary.js            # Dashboard statistics
├── templates/
│   ├── tpl-contacts.js       # Contact HTML templates
│   ├── tpl-login-sign-up.js  # Auth page templates
│   ├── tpl-navigation.js     # Navigation templates
│   └── tpl-user-profil-img.js # Avatar SVG templates
├── styles/
│   ├── contacts.css          # Contact page styles
│   ├── login-signup.css      # Authentication styles
│   └── [other CSS files]
└── assets/
    └── img/                  # Images and icons
```

## 🔧 Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Database**: Firebase Realtime Database
- **Authentication**: Session Storage based authentication
- **Icons & Images**: SVG, PNG
- **Responsive Design**: CSS Media Queries, Flexbox, Grid

## ✨ Features Details

### Task Management
- **Priority Levels**: Low (green), Medium (orange), High (red)
- **Categories**: User Story, Technical Task
- **Subtasks**: Checkbox tracking for task breakdown
- **Due Dates**: Calendar picker with validation
- **Search & Filter**: Real-time task filtering on board

### Contact Management
- **Profile Images**: Auto-generated colored circles with initials
- **Contact Details**: Name, email, phone number
- **Alphabetical Grouping**: Organized by first letter
- **Current User Indicator**: "(You)" tag for logged-in user

### Responsive Design
- **Desktop**: Full sidebar navigation, split-view layouts
- **Tablet**: Optimized spacing and touch targets
- **Mobile**: Hamburger menu, swipe-friendly interfaces, bottom navigation

### Drag and Drop
- **Visual Feedback**: Placeholder indicators during drag
- **Column Highlighting**: Drop zones highlight on hover
- **Touch Support**: Mobile-friendly drag implementation
- **Click Prevention**: Smart detection prevents accidental opens after drop

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers 

## 📝 Code Documentation

The project uses JSDoc for comprehensive code documentation:

- All functions include parameter and return type documentation
- Event listeners are documented with `@listens` tags
- Async functions marked with `@async` tag
- Complex objects have detailed property documentation

Generate HTML documentation (if JSDoc is installed):
```bash
jsdoc -c jsdoc.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Use JSDoc comments for all functions
- Follow existing naming conventions (camelCase for functions/variables)
- Use `const` by default, `let` only when reassignment is needed
- Keep functions under 15 lines when possible
- Use semantic HTML and CSS class naming

## 📄 License

This project is part of the Developer Akademie curriculum.

## 👥 Authors

- Join Team 1331 - Developer Akademie

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Developer Akademie for project guidance
- All contributors and testers

---

**Note**: This is an educational project created as part of the Developer Akademie full-stack web development course.
