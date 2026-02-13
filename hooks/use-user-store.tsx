/**
 * User Store - Re-Export
 * 
 * Dieser Hook ist ein Re-Export vom Haupt-User-Store.
 * Für Rückwärtskompatibilität mit bestehenden Imports.
 * 
 * Der eigentliche Store befindet sich in: src/stores/user.store.tsx
 */

export { useUserStore, type User, type AppSettings } from "@/src/stores/user.store";
