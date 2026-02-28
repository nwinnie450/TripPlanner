# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-02-28

### Added

- **Trip Management**: Create trips with passcode access (6-character alphanumeric, no sign-up required)
- **Collaborative Itinerary**: Day-by-day itinerary planning with time, title, location, and notes
- **Expense Tracking**: Record expenses with amount, category, payer, and equal splitting among selected members
- **Settlement Calculator**: Greedy debt simplification algorithm showing "who owes whom" with minimum transactions
- **Budget Dashboard**: Set trip budget and track spending with visual progress bar
- **Member Management**: Up to 8 members per trip, join via passcode
- **Mobile-First UI**: Responsive design at 375px (minimum 320px) with travel-inspired color palette
- **Bottom Navigation**: Dashboard, Itinerary, Expenses, and Settle tabs
- **Category Filtering**: Filter expenses by category (Food, Transport, Accommodation, Activities, Shopping, Other)
- **Passcode System**: Crypto-secure generation using 29-character alphabet (excludes ambiguous chars 0/O/1/I/L)
- **Rate Limiting**: 5 req/min for passcode validation, 60 req/min for general API access
- **Input Validation**: Zod schemas on all API endpoints with proper error responses
- **MongoDB Atlas**: Document-based storage with atomic operations ($push, $pull, $set with arrayFilters)
- **Test Suite**: 106 unit tests covering settlement algorithm, passcode generation, utilities, validation, and components

### Technical Stack

- Next.js 16 (App Router) with TypeScript
- MongoDB Atlas (free tier) with official Node.js driver
- Tailwind CSS v4 with custom travel-inspired theme
- SWR for client-side data fetching with 30-second revalidation
- Deployed on Vercel

### Documentation

- Product Requirements Document (PRD) with 12 user stories and acceptance criteria
- System Architecture document with data model, API design, and settlement algorithm
- UI Design specification with 7 screen wireframes and complete design token system
