'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMutation } from '@apollo/client/react';
import { gql } from '@/generated/gql';

const UPDATE_PREFERENCES = gql(`
  mutation UpdateThemePreference($input: UpdatePreferencesInput!) {
    updateUserPreferences(input: $input) {
      id
      preferences {
        theme
      }
    }
  }
`);

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [updatePreferences] = useMutation(UPDATE_PREFERENCES);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);

    // Sync to database (fire and forget)
    try {
      await updatePreferences({
        variables: {
          input: { theme: newTheme },
        },
      });
    } catch (error) {
      console.error('Failed to sync theme preference:', error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 transition-transform hover:scale-110"
          >
            {isDark ? (
              <Moon className="h-4 w-4 rotate-0 transition-all" />
            ) : (
              <Sun className="h-4 w-4 rotate-0 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {isDark ? 'light' : 'dark'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
