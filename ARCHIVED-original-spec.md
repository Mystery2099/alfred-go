> **⚠️ ARCHIVED / OUTDATED**
> This document describes the original prototype specification using React, Express, and Prisma. The project has since pivoted to **SvelteKit, Drizzle ORM, and SQLite**. This file is preserved for reference only and does not reflect the current architecture or tech stack.

# AlfredGO – Prototype Specification

## 📌 Overview

AlfredGO is a centralized student dashboard designed to simplify access to campus systems by reducing clutter, improving navigation, and prioritizing usability.

---

## 🎯 MVP Goals

The prototype will focus on:

* Search-first navigation
* Viewing tools/resources
* Bookmarking (favorites)
* Basic dashboard UI
* Role-based view (mocked if needed)

---

## 🧱 Tech Stack

### Frontend

* **Framework:** React (Vite)
* **Styling:** Tailwind CSS
* **State Management:** React Context or Zustand
* **Routing:** React Router

### Backend

* **Runtime:** Node.js
* **Framework:** Express.js

### Database

* **Type:** SQLite (dev) → PostgreSQL (future)
* **ORM:** Prisma

### Authentication

* **Prototype:** Mock auth / JWT
* **Future:** Alfred State SSO (SAML/OAuth)

---

## 🗂️ Core Features (MVP)

### 1. Dashboard

* Displays list of tools
* Shows favorites at top
* Responsive layout

### 2. Search

* Keyword-based search
* Filters tools by name/tags

### 3. Favorites

* Users can:

  * Add/remove favorites
  * Persist favorites in DB

### 4. Tool Access

* Clicking a tool redirects to external system

---

## 🧠 Data Model

### User

```json
{
  "id": "string",
  "name": "string",
  "role": "student | staff | admin"
}
```

### Tool

```json
{
  "id": "string",
  "name": "Canvas LMS",
  "description": "Courses and assignments",
  "url": "https://...",
  "category": "Academics",
  "tags": ["courses", "assignments"]
}
```

### Favorite

```json
{
  "id": "string",
  "userId": "string",
  "toolId": "string"
}
```

---

## 🔌 API Design

### GET /tools

Returns all tools

### GET /tools/search?q=

Returns filtered tools

### GET /favorites

Returns user favorites

### POST /favorites

Adds a favorite

### DELETE /favorites/:id

Removes a favorite

---

## 🔄 Application Flow

1. User logs in (mocked)
2. Dashboard loads:

   * Fetch tools
   * Fetch favorites
3. User:

   * Searches OR browses
   * Clicks tool → redirect
   * Adds/removes favorites

---

## 🎨 UI Structure

* Sidebar (navigation)
* Top bar (search)
* Main dashboard:

  * Favorites section
  * Tool grid

---

## 🔐 Security (Prototype Level)

* Input validation on API
* Basic auth token (JWT)
* No sensitive data stored

---

## 🚧 Future Features (Not in MVP)

* Full SSO integration
* Role-based dashboards (real logic)
* Card customization
* Tag-based filtering system
* Analytics dashboard

---

## 🧪 Known Limitations

* Mock authentication
* Static tool dataset (initially)
* No real-time updates
* Limited mobile optimization (initial version)

---

## 🚀 Development Plan

### Phase 1

* Setup frontend + backend
* Create basic UI layout

### Phase 2

* Implement tools API
* Display tools on dashboard

### Phase 3

* Add search functionality

### Phase 4

* Implement favorites system

### Phase 5

* Polish UI + responsiveness

---

