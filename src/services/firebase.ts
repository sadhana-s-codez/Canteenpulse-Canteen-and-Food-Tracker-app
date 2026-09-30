// ─── Mock Firebase Module ────────────────────────────────────────────
// This replaces the real Firebase SDK with localStorage-based mock data.
// No Firebase project or credentials required.

// We export mock instances so existing imports don't break,
// but all actual data operations happen in the individual service files.

export const auth = {} as any;
export const db = {} as any;
export const storage = {} as any;
export default {} as any;
