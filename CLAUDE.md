# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Software Acarreos" - a Next.js 15 web application for managing construction material transportation/hauling operations. The app has two main interfaces:
- **Admin Panel** (desktop): Full CRUD operations for managing trucks, drivers, materials, locations, and shipments
- **Operator Interface** (mobile-optimized): Simple workflow for dispatch and delivery operations

## Technology Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Database**: Google Firestore
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with IBM Carbon design principles
- **PWA**: Configured with next-pwa
- **Language**: TypeScript

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture Overview

### Data Models (`src/models/types.ts`)
Core entities with TypeScript interfaces:
- `Truck`: Vehicle management with status tracking
- `Driver`: Driver information with availability status
- `Material`: Construction materials catalog
- `Location`: Pickup/delivery locations
- `Shipment`: Transportation orders with denormalized data for performance
- `Ticket`: QR-based dispatch/delivery confirmations

### Database Layer (`src/lib/firebase/`)
- `firebase.ts`: Firebase configuration and initialization
- `firestore.ts`: Generic CRUD operations for all collections
- Collections: trucks, drivers, materials, locations, shipments, tickets

### Application Structure

#### Admin Panel (`src/app/admin/`)
Desktop-focused interface with:
- Sidebar navigation with responsive design
- CRUD pages for all master data (trucks, drivers, materials, locations)
- Shipments overview (read-only table)
- QR code generation for trucks, drivers, and materials
- Ticket reader for scanning QR codes
- Individual detail pages with large QR displays at `[entityId]/page.tsx`

#### Operator Interface (`src/app/operator/`)
Mobile-optimized workflow:
- Simple button-based navigation
- Text input for QR scanning (hardware scanner acts as keyboard)
- Dispatch flow: scan truck + driver + material → create shipment
- Delivery flow: scan shipment ID → mark as delivered
- Ticket display pages with QR codes

### Key Components (`src/components/`)

#### Admin Components (`src/components/admin/`)
- `DesktopSidebar`/`MobileSidebar`: Responsive navigation
- `Modal`: Reusable modal for CRUD operations
- Entity-specific forms: `TruckForm`, `DriverForm`, `MaterialForm`, `LocationForm`
- `QrCodeDisplay`: QR code generation using qr-code-styling
- `AdminQrReader`: Text input for reading QR codes

#### Operator Components (`src/components/operator/`)
Mobile-optimized components for field operations

#### UI Components (`src/components/ui/`)
Reusable UI elements following IBM Carbon design principles

## Important Implementation Notes

### QR Code Scanning
- **Hardware scanner approach**: QR scanner device inputs text directly (like a keyboard)
- Uses text input fields instead of camera-based scanning
- Avoids compatibility issues with QR scanning libraries in Next.js 15

### Firebase Security
- Development uses permissive Firestore rules: `allow read, write: if true;`
- Firebase configuration is committed (public project)

### Status Management
- Trucks and drivers have availability status (AVAILABLE/IN_SHIPMENT)
- Shipments track status (EN_TRANSITO/COMPLETADO)
- Denormalized data in shipments for display performance

### PWA Configuration
- Configured for offline capability
- App manifest at `/manifest.json`
- Service worker for caching

## Testing

No specific test framework is configured. The application relies on manual testing and TypeScript for type safety.

## Security Configuration

- **Environment Variables**: Firebase credentials stored in `.env.local` (not committed)
- **Firestore Rules**: Basic security rules in `firestore.rules` (development-permissive)
- **Security Documentation**: See `SECURITY.md` for complete security guidelines

## Known Constraints

- QR scanning libraries (html5-qrcode, @yudiel/react-qr-scanner) have compatibility issues with Next.js 15.5.4
- Uses text input approach for QR scanning instead of camera
- Firebase rules are permissive for development (not production-ready)
- Authentication not implemented (required for production deployment)