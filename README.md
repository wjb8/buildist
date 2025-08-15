# Buildist - Asset Management Tool

> **Phase 1: Barebones Demo (Proof of Concept)**

A React Native mobile application for offline-capable asset management, designed to demonstrate core functionality to funders, pilot partners, and early adopters.

## 🎯 Project Overview

**Buildist** is an asset management platform that enables communities to track, manage, and maintain their infrastructure assets. The platform focuses on creating a credible, functional proof-of-concept that showcases the core vision.

### Current Status: Phase 1 - Road Asset Management MVP ✅

**Phase 1 Implementation Complete:**

- ✅ **Database Layer**: Realm with SQLite, schema v2 with road-specific fields
- ✅ **Asset Types**: Road-focused infrastructure types (roads, bridges, sidewalks, street lights, traffic signals)
- ✅ **Core Screens**: Asset creation/editing form with road-specific fields, asset list view with filtering
- ✅ **Data Model**: Comprehensive road asset properties (surface type, traffic volume, dimensions, speed limits)
- ✅ **Offline Capability**: Full offline operation with local data persistence
- ✅ **UI/UX**: Clean, functional interface with road-specific information display

**In Progress for Full MVP:**

- 🔄 **Demo Data**: Example road assets for investor demonstration
- 🔄 **Admin Authentication**: Basic login gate for access control
- 🔄 **AI Integration**: Natural language prompt parser

### Key Objectives

- Demonstrate offline-capable road asset management
- Showcase comprehensive road infrastructure data capture
- Provide a functional demo for stakeholder presentations
- Establish the foundation for future development phases

## 🚀 Core Features (Phase 1)

### Asset Management

- **Road-Focused Asset Types**: Primary focus on road infrastructure including:
  - **Roads**: Main road assets with detailed specifications
  - **Bridges**: Bridge infrastructure assets
  - **Sidewalks**: Pedestrian walkway assets
  - **Street Lights**: Lighting infrastructure
  - **Traffic Signals**: Traffic control assets
- **Rich Road Data**: Comprehensive road asset information including:
  - Surface type (asphalt, concrete, gravel, dirt, paver)
  - Traffic volume (residential, collector, arterial, highway)
  - Physical dimensions (length, width, lanes)
  - Speed limits and traffic regulations
- **Offline Entry Form**: Add/edit road assets with local data storage
- **Asset List View**: Simple, filterable list with road-specific information display
- **Demo Data**: Preloaded example records for demonstration

### AI Integration

- **Natural Language Input**: Parse prompts like "Add road Cedar Lane with poor condition"
- **Auto-form Filling**: Convert prompts to structured asset data
- **OpenAI API Integration**: Leverage AI for intelligent data parsing

### User Experience

- **Basic Admin Login**: Simple authentication gate for access control
- **Offline-First Design**: All operations work without internet connection
- **Minimal UI**: Wireframe-level design focused on functionality over aesthetics

## 🏗️ Technical Architecture

### Frontend

- **Framework**: Expo + React Native
- **Language**: TypeScript
- **Styling**: Custom design system with styled-components
- **State Management**: Local state + Realm for persistence

### Data Layer

- **Local Storage**: Realm with SQLite adapter
- **Database Schema**: Version 2 with road-specific fields
  - Asset metadata (name, type, location, condition, notes)
  - Road-specific properties (surface type, traffic volume, dimensions, lanes, speed limit)
  - Inspection tracking and maintenance history
- **Offline Capability**: Full offline operation with local data
- **Scope**: Local-only operation for Phase 1 demo

### External Services

- **AI Processing**: OpenAI API for prompt parsing
- **File Storage**: S3/Backblaze B2 (future implementation)
- **Push Notifications**: Firebase Cloud Messaging (future use)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- React Native development environment
- iOS Simulator / Android Emulator

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd buildist

# Install dependencies
npm install

# Start the development server
npm start
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Add your OpenAI API key
OPENAI_API_KEY=your_api_key_here
```

## 🗄️ Database Schema

### Current Version: v2

The database schema has been updated to support road-focused asset management with the following structure:

#### Assets Table

- **Core Fields**: `id`, `type`, `name`, `location`, `condition`, `notes`, `qr_tag_id`
- **Road-Specific Fields**:
  - `surface_type`: Road surface material (asphalt, concrete, gravel, dirt, paver)
  - `traffic_volume`: Traffic level (low, medium, high, very_high)
  - `length`: Road length in meters
  - `width`: Road width in meters
  - `lanes`: Number of traffic lanes
  - `speed_limit`: Speed limit in km/h
- **Metadata**: `created_at`, `updated_at`, `synced`

#### Inspections Table

- **Fields**: `id`, `asset_id`, `inspector`, `description`, `score`, `timestamp`
- **Maintenance**: `maintenance_needed`, `next_due`
- **Metadata**: `created_at`, `updated_at`, `synced`

### Schema Migration

When upgrading from v1 to v2, the database will automatically add the new road-specific fields. For development/testing, you can reset the database:

```bash
# Reset database (development only)
npm run db:reset
```

## 🛣️ Asset Types & Usage

### Primary Asset Types (Phase 1 Focus)

#### Road Assets

- **Type**: `AssetType.ROAD`
- **Purpose**: Main road infrastructure management
- **Required Fields**: Name, condition
- **Optional Fields**: Location, notes, surface type, traffic volume, dimensions, lanes, speed limit

#### Supporting Infrastructure

- **Bridges** (`AssetType.BRIDGE`): Bridge assets with road-like properties
- **Sidewalks** (`AssetType.SIDEWALK`): Pedestrian walkway assets
- **Street Lights** (`AssetType.STREET_LIGHT`): Lighting infrastructure
- **Traffic Signals** (`AssetType.TRAFFIC_SIGNAL`): Traffic control assets

### Road Asset Properties

#### Surface Types

- **Asphalt**: Standard paved roads
- **Concrete**: High-durability paved roads
- **Gravel**: Unpaved rural roads
- **Dirt**: Basic unpaved roads
- **Paver**: Decorative paved surfaces

#### Traffic Volume Levels

- **Low**: Residential streets (local traffic)
- **Medium**: Collector roads (neighborhood traffic)
- **High**: Arterial roads (major traffic flow)
- **Very High**: Highways and major thoroughfares

### Asset Management Workflow

1. **Create Asset**: Select road type and fill in basic information
2. **Add Details**: Specify surface type, traffic volume, dimensions
3. **Track Condition**: Monitor asset condition over time
4. **Schedule Inspections**: Plan regular maintenance checks
5. **Generate Reports**: Export asset data for analysis

## 🎨 Design System

Buildist uses a design token system for consistent styling:

- **Colors**: Semantic color mappings (primary, neutral, success, warning, error)
- **Typography**: Consistent font sizes and weights
- **Spacing**: 4px base unit system (xs, sm, md, lg, xl, 2xl)
- **Components**: Reusable styled components with semantic props

See `src/styles/README.md` for detailed styling guidelines.

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Development Build

```bash
# iOS
npm run ios

# Android
npm run android

# Web (if needed)
npm run web
```

### Production Build

```bash
# Build for production
expo build:android
expo build:ios
```
