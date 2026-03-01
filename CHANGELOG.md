# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-03-01

### Added

- **Email + password authentication**: Users sign up with name, email, and password; log in to access the app
- **JWT session management**: httpOnly cookies with 30-day expiry using `jose` (Edge-compatible) and `bcryptjs` for password hashing
- **Route protection middleware**: All non-public routes require authentication; unauthenticated users redirected to `/login?redirect={path}`
- **AuthContext provider**: Provides `user`, `isLoading`, `login`, `signup`, `logout` throughout the app
- **Login and signup pages**: Forms with redirect preservation so trip links work seamlessly after authentication
- **Auto-join trips**: When accessing a trip for the first time, users are automatically joined using their account name (no name input needed)
- **Idempotent member join**: Re-joining a trip with the same userId returns the existing member instead of creating a duplicate
- **Itinerary activity categories**: 8 color-coded categories (Food, Sightseeing, Transport, Hotel, Shopping, Nightlife, Activity, Other) with emoji badges
- **Itinerary map view**: Google Map with markers for geolocated activities, InfoWindows with details, and a list of activities without coordinates
- **List/Map toggle**: Switch between day-by-day list view and map view on the itinerary page
- **Logout button**: Displayed on home page with user greeting ("Hi, [name]")

### Changed

- **Default currency**: Changed from USD to SGD
- **Currency list**: Expanded from 10 to 19 currencies, prioritizing SGD, JPY, KRW, CNY, MYR, USD, THB, VND plus common international currencies
- **Join page**: Replaced name input form with automatic join flow using authenticated user's name
- **TripContext**: Resolves current member by matching `userId` from auth instead of localStorage
- **Trip layout**: Validates membership by `userId` and redirects non-members to join page
- **Members API**: Accepts optional `userId` field, links members to user accounts

### Removed

- **localStorage member storage**: Replaced by server-side userId-based member resolution
- **`use-places-autocomplete` package**: Replaced with native `google.maps.places.AutocompleteService`
- **`@googlemaps/js-api-loader` package**: Unused, removed from dependencies

## [0.1.0] - 2026-02-28

### Added

- **Trip creation**: Create a trip with a name, dates, currency, and optional budget — no account required
- **Passcode access**: Each trip gets a unique 6-character passcode (crypto-secure, excludes ambiguous characters) that members use to join
- **Member management**: Up to 8 members can join a trip by entering its passcode
- **Collaborative itinerary**: Plan a day-by-day schedule with time, title, location, and notes per entry
- **Expense tracking**: Record expenses with amount, description, category, payer, and which members split the cost equally
- **Category filtering**: Filter the expense list by category (Food, Transport, Accommodation, Activities, Shopping, Other)
- **Budget dashboard**: View total spending against the trip budget with a visual progress bar
- **Settlement calculator**: Automatically calculates the minimum number of payments needed to settle all balances using a greedy debt-simplification algorithm
- **Bottom navigation**: Persistent nav bar with tabs for Dashboard, Itinerary, Expenses, and Settle
- **Mobile-first UI**: Responsive layout optimised for 375 px screens (minimum 320 px) with a travel-inspired color palette
- **Rate limiting**: 5 requests/min for passcode validation; 60 requests/min for all other API endpoints
- **Input validation**: All API endpoints validated with Zod schemas; structured error responses on every failure
- **15 API routes**: Full REST API covering trips, members, itinerary items, expenses, and settlement
- **106 unit tests**: Coverage of the settlement algorithm, passcode generation, utility functions, input validation, and UI components

[Unreleased]: https://github.com/nwinnie450/grouptrip/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/nwinnie450/grouptrip/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nwinnie450/grouptrip/releases/tag/v0.1.0
