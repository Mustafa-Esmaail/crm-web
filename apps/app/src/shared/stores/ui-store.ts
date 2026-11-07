import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  toggleSidebar: () => void;
  setMobileNavOpen: (isOpen: boolean) => void;
}

// Only layout preferences live here; server data belongs to TanStack Query.
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileNavOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setMobileNavOpen: (isOpen) => set({ isMobileNavOpen: isOpen }),
    }),
    {
      name: 'crm-ui',
      partialize: (state) => ({ isSidebarCollapsed: state.isSidebarCollapsed }),
    },
  ),
);
