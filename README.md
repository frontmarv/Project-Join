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
Project_Join/                              # Projekt-Root
├── .gitignore                             # Enthält Muster für nicht versionierte Dateien/Ordner
├── README.md                              # Projektübersicht, Installation & Nutzungshinweise
├── index.html                             # Einstieg / Login-Seite der Anwendung
├── script.js                              # Globale Helferfunktionen & ggf. Firebase-Initialisierung
├── style.css                              # Basis-CSS / globale Styles
├── jsdoc.json                             # Konfiguration für JSDoc-Generierung
├── package.json                           # npm-Metadaten (Name, Skripte, Abhängigkeiten)
├── package-lock.json                      # Versionssperre für npm-Abhängigkeiten
├── assets/                                # Statische Ressourcen (Bilder, Schriftarten, ...)
│   ├── fonts/                                  # Schriftdateien (z. B. .woff, .ttf)
│   └── img/                                    # Logos, Icons und sonstige Bilder
├── docs/                                  # (Optional) generierte Dokumentation / JSDoc-Ausgabe
├── pages/                                 # Vollständige HTML-Seiten / Page-Templates
│   ├── add-task-insert.html                    # HTML-Partial / Insert für Add-Task-Komponenten
│   ├── add-task.html                           # Seite mit Formular zum Erstellen einer Aufgabe
│   ├── board.html                              # Kanban-Board-Seite (Spalten & Interaktion)
│   ├── contacts.html                           # Kontaktübersicht / Kontaktverwaltung
│   ├── help.html                               # Hilfeseite / Benutzeranleitungen
│   ├── legal-notice-external.html              # Externe Variante des Impressums (z. B. für iframe)
│   ├── legal-notice.html                       # Impressum / rechtliche Hinweise
│   ├── privacy-policy-external.html            # Externe Variante der Datenschutz-Seite
│   ├── privacy-policy.html                     # Datenschutz / Privacy Policy
│   ├── sign-up.html                            # Registrierungsseite / Sign-Up-Formular
│   └── summary.html                            # Dashboard / Übersicht mit Statistiken
├── scripts/                               # JavaScript-Module / Seiten- und UI-Logik
│   ├── add-task-alert-overlay.js               # Overlay- und Hinweislogik beim Anlegen von Tasks
│   ├── add-task-validation.js                  # Eingabevalidierung für Add-Task-Formulare
│   ├── add-task.js                             # Hauptlogik der Add-Task-Seite (Datenverarbeitung)
│   ├── authentication.js                       # Auth-Checks, Session-Handling & Zugriffsprüfung
│   ├── board-helper.js                         # Hilfsfunktionen für Board-Rendering & Logik
│   ├── board.js                                # Kern-Logik des Kanban-Boards (Statuswechsel)
│   ├── contacts.js                             # Kontakt-CRUD, Anzeige und Sortierung
│   ├── db.js                                   # Schnittstelle zur Firebase Realtime Database
│   ├── dlg-add-task-subtask-handling.js        # Subtask-Handling innerhalb Add-Task-Dialogen
│   ├── dlg-edit-task-assignment.js             # Dialog-Logik zum Zuweisen von Personen
│   ├── dlg-edit-task.js                        # Editier-Dialog für Aufgaben (Speichern/Abbrechen)
│   ├── dlg-task-info-helper.js                 # Hilfsfunktionen für Task-Info-Dialoge
│   ├── dlgs-contact.js                         # Management und Darstellung von Kontakt-Dialogen
│   ├── drag-and-drop-helper.js                 # Utility-Funktionen für Drag & Drop Verhalten
│   ├── drag-and-drop.js                        # Implementierung der Drag & Drop-Interaktionen
│   ├── generate-user-id.js                     # Generierung und Verwaltung von User-IDs
│   ├── load-inserts.js                         # Dynamisches Laden von HTML-Insert/Partials
│   ├── login.js                                # Login-Seiten-Logik (Formular, Fehler, Guest-Login)
│   ├── mail-tld-validator.js                   # Validierung der E-Mail-TLDs (Whitelist/Checks)
│   ├── manage-user-profil.js                   # Anzeige/Änderung von Benutzerprofilen
│   ├── navigation.js                           # Responsive Navigation & Sidebar-Verhalten
│   ├── search-task.js                          # Such- und Filterfunktionen für Aufgaben
│   ├── sign-up.js                              # Registrierung / Sign-Up-Flow & Validierung
│   ├── summary.js                              # Dashboard-Logik (Statistiken, Karten, Termine)
│   └── task-card.js                            # Erzeugung, Rendering und Interaktion von Task-Karten
├── templates/                             # Clientseitige HTML-Templates (JS-Module)
│   ├── tpl-add-task.js                         # Template(s) für Add-Task-Komponenten / Formulare
│   ├── tpl-board.js                            # Templates für Board-Spalten & Platzhalter
│   ├── tpl-contacts.js                         # Templates für Kontaktlisten & Listeneinträge
│   ├── tpl-dialogs.js                          # Templates für Modal-Dialoge & Overlays
│   ├── tpl-login-sign-up.js                    # Templates für Login- und Sign-Up-Formulare
│   ├── tpl-navigation.js                       # Template für Navigation / Sidebar-Markup
│   ├── tpl-task-card.js                        # Template für die Darstellung einer Task-Karte
│   └── tpl-user-profil-img.js                  # Template / SVG-Generator für Nutzer-Avatare
└── styles/                                # CSS-Dateien, nach Seite/Komponente getrennt
    ├── add-task.css                            # Styles für Add-Task-Seite & Dialoge
    ├── board.css                               # Styles für das Kanban-Board (Spalten & Karten)
    ├── contacts.css                            # Styles für die Kontakte-Ansicht
    ├── dlg-add-task.css                        # Styles für Add-Task-Dialoge
    ├── dlg-contact.css                         # Styles für Kontakt-Dialoge
    ├── dlg-edit-task.css                       # Styles für Edit-Task-Dialoge
    ├── dlg-task-info.css                       # Styles für Task-Info-Dialoge
    ├── external.css                            # Gemeinsame externe Styles / Resets
    ├── header.css                              # Header- und Topbar-Styles
    ├── help.css                                # Styles für die Hilfeseite
    ├── legal-notice.css                        # Styles für Impressum & rechtliche Seiten
    ├── login-signup.css                        # Styles für Login- und Signup-Seiten
    ├── navigation.css                          # Styles für Navigation / Sidebar
    ├── privacy-policy.css                      # Styles für Datenschutz-Seite
    ├── summary.css                             # Styles für das Dashboard / Übersicht
    └── task-card.css                           # Styles für einzelne Task-Karten
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
