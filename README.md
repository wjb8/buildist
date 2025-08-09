# Buildist - Asset Management Tool

> **Phase 1: Barebones Demo (Proof of Concept)**

A React Native mobile application for offline-capable asset management, designed to demonstrate core functionality to funders, pilot partners, and early adopters.

## 🎯 Project Overview

**Buildist** is an asset management platform that enables communities to track, manage, and maintain their infrastructure assets. The platform focuses on creating a credible, functional proof-of-concept that showcases the core vision.

### Key Objectives

- Demonstrate offline-capable asset management
- Showcase AI-powered natural language input
- Provide a functional demo for stakeholder presentations
- Establish the foundation for future development phases

## 🚀 Core Features (Phase 1)

### Asset Management

- **Single Asset Type**: Road assets (expandable in future phases)
- **Offline Entry Form**: Add/edit road assets with local data storage
- **Asset List View**: Simple, filterable list of entered assets
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
- **State Management**: Local state + WatermelonDB for persistence

### Data Layer

- **Local Storage**: WatermelonDB with SQLite adapter
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
