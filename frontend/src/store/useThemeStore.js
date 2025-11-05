import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark' | 'system'

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          applyTheme(newTheme);
          return { theme: newTheme };
        });
      },

      initTheme: () => {
        set((state) => {
          applyTheme(state.theme);
          return state;
        });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

function applyTheme(theme) {
  const root = window.document.documentElement;

  if (theme === 'system') {
    // Use system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', systemTheme);
    // Also set class for Tailwind compatibility
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    // Use selected theme
    root.setAttribute('data-theme', theme);
    // Also set class for Tailwind compatibility
    root.classList.toggle('dark', theme === 'dark');
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      const root = window.document.documentElement;
      const systemTheme = e.matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
      root.classList.toggle('dark', e.matches);
    }
  });
}
