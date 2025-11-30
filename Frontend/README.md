# Angular Project

This project was recreated in Angular 17+ with Tailwind CSS v3, following the original React design.

## Prerequisites

- Node.js (v18 or higher)
- Angular CLI (`npm install -g @angular/cli`)

## Setup

1.  Navigate to the project directory:
    ```bash
    cd angular
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    ng serve
    ```

4.  Open your browser at `http://localhost:4200`.

## Features

-   **Standalone Components**: All components are standalone.
-   **Tailwind CSS**: Styled using Tailwind CSS v3.
-   **Routing**: Configured in `src/app/app.routes.ts`.
-   **Backend Binding**: `ApiService` (`src/app/services/api.service.ts`) is used to fetch data, ready for backend integration.
-   **Control Flow**: Uses new `@if` and `@for` syntax.
-   **Messaging Removed**: Messaging features have been removed as requested.

## Project Structure

-   `src/app/components`: Shared components (Navbar, Sidebar, etc.)
-   `src/app/pages`: Page components (Home, Dashboard, Profile, etc.)
-   `src/app/services`: API services.
-   `src/app/models`: Data models.

## Notes

-   `lucide-angular` is used for icons.
-   Placeholder components are used for pages that were not fully implemented in the initial migration but are routed.
