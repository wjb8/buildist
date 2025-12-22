## Model Architecture for Phase 1

This is intentional for Phase 1. We've refactored to use a **generic `Asset` model** that stores only base fields (`type`, `name`, `condition`, `notes`, `qrTagId`, `location`, etc.). 

**Road and Vehicle are now plain TypeScript classes** (not `Realm.Object` subclasses) - they exist for type safety but are **not stored in Realm during Phase 1**. Only generic `Asset` instances are persisted.

**Why:**
- Simplifies Phase 1 development (single model to maintain)
- Allows flexible asset management without schema migrations
- Road-specific fields (surfaceType, trafficVolume, etc.) are intentionally not stored in Phase 1
- Future phases can convert Road/Vehicle to Realm models with specialized schemas if needed

**Migration:**
- Not in production yet, so no migration needed
- Demo data seeds generic `Asset` instances
- When we do need migration, we'll transform Road/Vehicle → Asset records

The "silent data loss" is expected behavior for Phase 1 - the UI may collect road-specific fields, but only base Asset fields are persisted per the Phase 1 requirements.

