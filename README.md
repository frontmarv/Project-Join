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
Project_Join/					                # Project-Root
├── .gitignore					                # Git-Ignore-Regeln
├── README.md					                # Projektbeschreibung und Anleitung
├── index.html					                # Login / Einstiegspunkt der App
├── script.js					                # Globale Hilfsfunktionen & ggf. Firebase-Konfiguration
├── style.css					                # Basisstil / globale CSS-Regeln
├── jsdoc.json					                # Konfiguration für JSDoc-Generierung
├── package.json				                # npm Metadaten (Projektinfo & Skripte)
├── package-lock.json			                # npm Lockfile (Abhängigkeiten gesperrt)
├── assets/					                # Statische Assets
│   ├── fonts/					                # Schriftdateien
│   └── img/					                # Bilder und Icons
├── docs/						            # Dokumentation / ggf. generierte JSDoc-Ausgabe
├── pages/						            # HTML-Seiten
│   ├── add-task-insert.html		            # HTML-Insert/Partial für Add-Task-Komponenten
│   ├── add-task.html			                # Seite / Formular zum Erstellen von Aufgaben
│   ├── board.html				                # Kanban-Board Seite (Spalten: To Do / In Progress / Done)
│   ├── contacts.html			                # Kontaktverwaltung Seite
│   ├── help.html				                # Hilfeseite / Anleitung
│   ├── legal-notice-external.html              # Externe Version des Impressums
│   ├── legal-notice.html		                # Impressum / rechtliche Hinweise
│   ├── privacy-policy-external.html            # Externe Version der Datenschutz-Seite
│   ├── privacy-policy.html		                # Datenschutz / Privacy Policy
│   ├── sign-up.html			                # Registrierungsseite
│   └── summary.html			                # Dashboard / Übersicht (Statistiken)
├── scripts/					            # JavaScript-Module / Seitenlogik
│   ├── add-task-alert-overlay.js	            # Overlay / Hinweise beim Erstellen von Tasks
│   ├── add-task-validation.js	                # Validierung für Add-Task-Formular
│   ├── add-task.js				                # Logik der Add-Task-Seite (Formularverarbeitung)
│   ├── authentication.js		                # Login-/Session-Prüfung und Auth-Hilfen
│   ├── board-helper.js			                # Hilfsfunktionen für das Board
│   ├── board.js				                # Hauptlogik für das Kanban-Board
│   ├── contacts.js				                # CRUD- und UI-Logik für Kontakte
│   ├── db.js					                # Firebase / Datenbank-Interaktionen
│   ├── dlg-add-task-subtask-handling.js    # Dialog-Logik für Subtasks
│   ├── dlg-edit-task-assignment.js	            # Dialog zum Zuweisen von Personen zu Tasks
│   ├── dlg-edit-task.js		                # Dialog-/Editier-Logik für Tasks
│   ├── dlg-task-info-helper.js	                # Helfer für Task-Info-Dialoge
│   ├── dlgs-contact.js			                # Kontakt-Dialog-Management
│   ├── drag-and-drop-helper.js	                # Hilfsfunktionen für Drag & Drop
│   ├── drag-and-drop.js		                # Drag & Drop Implementierung fürs Board
│   ├── generate-user-id.js		                # Erzeugung / Verwaltung von User-IDs
│   ├── load-inserts.js			                # Lädt HTML-Inserts/Partials in Seiten
│   ├── login.js				                # Login-Seiten-Logik
│   ├── mail-tld-validator.js	                # Validierung von E-Mail-TLDs
│   ├── manage-user-profil.js	                # Nutzerprofil-Verwaltung
│   ├── navigation.js			                # Responsive Navigation / Menüverhalten
│   ├── search-task.js			                # Such-/Filter-Funktionen für Tasks
│   ├── sign-up.js				                # Sign-Up / Registrierungs-Logik
│   ├── summary.js				                # Dashboard-Statistiken & Zusammenfassungen
│   └── task-card.js			                # Rendering & Verhalten einzelner Task-Karten
├── templates/					            # Clientseitige HTML-Templates (JS-Module)
│   ├── tpl-add-task.js			                # Templates für Add-Task-Komponenten
│   ├── tpl-board.js			                # Templates für Board-Strukturen und Platzhalter
│   ├── tpl-contacts.js			                # Templates für Kontaktlisten / Einträge
│   ├── tpl-dialogs.js			                # Templates für verschiedene Dialoge / Modals
│   ├── tpl-login-sign-up.js	                # Templates für Login- & Signup-Formulare
│   ├── tpl-navigation.js		                # Templates für Navigation / Sidebar
│   ├── tpl-task-card.js		                # Template für Task-Karten (Markup)
│   └── tpl-user-profil-img.js	                # Template / SVG für Benutzer-Avatare
└── styles/					                # CSS-Dateien nach Seite/Komponente aufgeteilt
    ├── add-task.css			                # Styles für Add-Task Seite & Dialoge
    ├── board.css				                # Styles für das Kanban-Board
    ├── contacts.css			                # Styles für die Kontaktseite
    ├── dlg-add-task.css		                # Styles für Add-Task-Dialog
    ├── dlg-contact.css		                    # Styles für Kontakt-Dialoge
    ├── dlg-edit-task.css		                # Styles für Edit-Task-Dialog
    ├── dlg-task-info.css		                # Styles für Task-Info-Dialog
    ├── external.css			                # Externe / gemeinsame Styles (Resets o.ä.)
    ├── header.css				                # Header / obere Leiste Styles
    ├── help.css				                # Styles für die Hilfeseite
    ├── legal-notice.css		                # Styles für Impressum / rechtliche Seiten
    ├── login-signup.css		                # Styles für Login & Signup Seiten
    ├── navigation.css			                # Styles für Navigation / Menü
    ├── privacy-policy.css		                # Styles für Datenschutz-Seite
    ├── summary.css			                    # Styles für Dashboard / Zusammenfassung
    └── task-card.css			                # Styles für Task-Karten-Komponenten
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
