# Mawaaedy (Appointment Booking)

A responsive Arabic-first appointment booking web app for gyms, barbers, and clinics. Users can sign up, book time slots, and track bookings. Service providers can register their services, manage schedules, and view upcoming bookings.

## Features

- User and provider authentication (client-side)
- Provider profiles with schedules
- Booking flow with confirmation
- User profile with booking history
- Provider dashboard with bookings
- Mobile-first responsive layout

## Pages

- `index.html` - Landing page
- `auth.html` - Login / Register
- `providers.html` - Providers listing
- `booking.html` - Booking schedule
- `profile.html` - User profile
- `dashboard.html` - Provider dashboard

## Data Storage

This project stores data in the browser using `LocalStorage`:

- `fs_users` - User accounts
- `fs_providers` - Provider data
- `fs_bookings` - Bookings
- `fs_current_user` - Current session

Initial providers load from `data/providers.json` on first run.

## Run Locally

Because the project fetches JSON data, use a local server:

```bash
# Using VS Code Live Server extension
# Right-click index.html > Open with Live Server
```

Or with Python:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500/index.html`.

## Project Structure

```
.
├── app.js
├── auth.html
├── booking.html
├── dashboard.html
├── data
│   └── providers.json
├── imgs
├── index.html
├── profile.html
├── providers.html
└── style.css
```

## Notes

- All authentication and data updates are client-side only.
- For production, replace LocalStorage with a backend API.

## License

MIT
