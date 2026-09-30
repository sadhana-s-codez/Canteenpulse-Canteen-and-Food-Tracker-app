// ─── Mock Seed Data ──────────────────────────────────────────────────
// Data is auto-seeded by foodService.ts and realtimeService.ts on import.
// This function exists only for backward compatibility.

import { initializeCanteenStatus } from './realtimeService';

export const seedDatabase = async (): Promise<boolean> => {
  // Food items and categories are auto-seeded by foodService.ts
  // Just ensure canteen status is initialized
  await initializeCanteenStatus();
  console.log('Mock database ready!');
  return true;
};
