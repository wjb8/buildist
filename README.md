# 🏗️ Buildist - Asset Management & Inspection Platform

A React Native/Expo application designed for asset management and inspection tracking, with offline-first capabilities powered by WatermelonDB.

## 📋 Project Overview

**Buildist** is an enterprise-grade asset management application that enables field workers to track equipment, perform inspections, and maintain compliance records - all while working offline. The platform provides real-time asset visibility, automated maintenance scheduling, and comprehensive audit trails.

## 🗄️ Database Architecture

### **Current Status: Database Schema & Data Models Complete**

We've established the foundational database structure for tracking assets and their inspection history using WatermelonDB with SQLite.

#### **Database Tables**

##### **1. Assets Table**

**Purpose**: Central repository for all physical assets across the organization

**Key Fields**:

- **Type**: Equipment, Vehicle, Building, Furniture, Tool, or Other
- **Name**: Asset identifier (e.g., "Forklift #5", "Warehouse A")
- **Location**: Where the asset is currently located
- **Condition**: Current health status (Excellent, Good, Fair, Poor, Critical)
- **Notes**: Additional context or special instructions
- **QR Tag ID**: Unique identifier for scanning and tracking
- **Sync Status**: Tracks whether data has been uploaded to server

**Business Value**: Single source of truth for all equipment inventory

##### **2. Inspections Table**

**Purpose**: Complete audit trail of all asset inspections and maintenance

**Key Fields**:

- **Asset Reference**: Links to specific asset being inspected
- **Inspector**: Who performed the inspection
- **Description**: What was checked during inspection
- **Score**: AI-powered rating (1-10 scale)
- **Maintenance Flag**: Automatic alert when issues detected
- **Next Due Date**: When next inspection is scheduled
- **Sync Status**: Ensures offline data gets uploaded

**Business Value**: Compliance tracking, maintenance scheduling, quality assurance

#### **Data Validation & Constraints**

##### **Asset Types** (Predefined Options)

- **Equipment**: Machinery, production equipment
- **Vehicle**: Trucks, forklifts, company cars
- **Building**: Facilities, warehouses, offices
- **Furniture**: Desks, chairs, storage units
- **Tool**: Hand tools, power tools
- **Other**: Miscellaneous items

##### **Asset Conditions** (Standardized Ratings)

- **Excellent**: Like new, no issues
- **Good**: Minor wear, fully functional
- **Fair**: Some wear, needs attention soon
- **Poor**: Significant issues, maintenance required
- **Critical**: Safety hazard, immediate action needed

## 🚀 Technical Architecture

### **Offline-First Design**

- **Local Storage**: All data stored on device (no internet required)
- **Sync Ready**: Automatic upload when connection restored
- **Conflict Resolution**: Built-in handling for data conflicts

### **Performance Features**

- **Indexed Queries**: Fast asset lookups by type, condition, location
- **Relationship Mapping**: Easy to find all inspections for any asset
- **Timestamp Tracking**: Complete audit trail of all changes

### **Tech Stack**

- **React Native 0.79.5** with Expo SDK 53
- **WatermelonDB 0.28.0** for offline database
- **React Navigation 7** for routing
- **TypeScript 5.8** for type safety
- **SQLite** with JSI enabled for performance

## 💼 Business Use Cases Supported

### **Field Operations**

- Inspectors can work offline in remote locations
- QR code scanning for quick asset identification
- Real-time condition updates and photo documentation

### **Compliance & Reporting**

- Complete inspection history for regulatory requirements
- Maintenance scheduling and due date tracking
- Performance metrics and trend analysis

### **Asset Lifecycle Management**

- Track asset condition over time
- Plan maintenance and replacement schedules
- Optimize asset utilization and placement

## 🎯 Development Roadmap

### **Phase 1: Core Functionality** (In Progress)

- Database schema and models
- Basic asset CRUD operations
- Navigation structure
- Asset listing and form screens

### **Phase 2: Enhanced Features** (Planned)

- QR code scanning integration
- Photo/document attachment
- Advanced filtering and search
- Inspection workflow

### **Phase 3: AI & Analytics** (Planned)

- Automated condition assessment
- Predictive maintenance alerts
- Performance analytics dashboard
- Advanced reporting

## 🔧 Project Structure

```
src/
├── storage/           # Database layer
│   ├── database.ts    # Database configuration
│   ├── schema.ts      # SQLite schema definition
│   └── models/        # WatermelonDB models
│       ├── Asset.ts   # Asset data model
│       └── Inspection.ts # Inspection data model
├── types/             # TypeScript type definitions
│   └── models.ts      # Enums and interfaces
├── screens/           # App screens
│   ├── AssetListScreen.tsx
│   └── AssetFormScreen.tsx
├── components/        # Reusable UI components
├── utils/             # Helper functions
└── api/               # Backend integration (planned)
```

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator

### **Installation**

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### **Database Operations**

```typescript
// Import database and collections
import { database, collections } from "@storage/database";

// Query assets
const assets = await collections.assets.query().fetch();

// Create new asset
await collections.assets.create((asset) => {
  asset.type = AssetType.EQUIPMENT;
  asset.name = "New Equipment";
  asset.condition = AssetCondition.GOOD;
});

// Reset database (development only)
import { resetDatabase } from "@storage/database";
await resetDatabase();
```

## 🧪 Testing

The project includes comprehensive testing setup with Jest:

- **Coverage Threshold**: 80% statements, 75% branches, 80% functions
- **Test Commands**: `npm test`, `npm run test:watch`, `npm run test:coverage`

## 📱 Key Benefits for Stakeholders

- **Operations Teams**: Real-time asset visibility, offline capability
- **Maintenance**: Proactive scheduling, issue tracking
- **Compliance**: Complete audit trails, regulatory reporting
- **Management**: Asset utilization insights, cost optimization

## 🔮 Future Enhancements

- **Real-time Sync**: Multi-device synchronization
- **Advanced Analytics**: Predictive maintenance algorithms
- **Integration**: ERP system connectivity
- **Mobile Features**: GPS tracking, photo documentation
- **Reporting**: Custom dashboard creation

---

This foundation gives us a robust, scalable platform that can grow with your asset management needs while maintaining data integrity and offline reliability.
