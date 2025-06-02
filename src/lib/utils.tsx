import type { MantineTheme } from '@mantine/core';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

// Combine clsx and tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date as distance to now (e.g., "2 days ago")
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();

  // Convert to seconds, minutes, hours, days
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'}`;
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'}`;
  }
  return `${diffInSeconds} ${diffInSeconds === 1 ? 'second' : 'seconds'}`;
}

// Format bytes to human-readable format
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Generate a random ID
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Format percentage
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'completed':
      return 'green';
    case 'pending':
      return 'blue';
    case 'running':
      return 'cyan';
    case 'stopped':
      return 'yellow';
    case 'failed':
    case 'error':
      return 'red';
    default:
      return 'gray';
  }
}

// Format date to readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Format date to simple format (e.g., "Jan 15, 2024")
export function formatDateSimple(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Get task type color - consistent across the app
export function getTaskTypeColor(taskType: string): string {
  // Map task types to Mantine color names for consistent colors across the app
  // These should match the theme.other.taskTypes values but return just the color name
  switch (taskType) {
    case "trafficStatistics":
      return "teal";
    case "trainDetection":
      return "indigo";
    // Legacy task type names (if needed)
    case "detection":
      return "blue";
    case "classification":
      return "green";
    case "counting":
      return "orange";
    case "tracking":
      return "violet";
    default:
      return "gray";
  }
}

// Escape special regex characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlight search term in text
export function highlightSearchTerm(
  text: string | null | undefined, 
  searchTerm: string,
  options?: {
    backgroundColor?: string;
    textColor?: string;
    theme?: MantineTheme;
    isDark?: boolean;
  }
): ReactNode {
  if (!text || !searchTerm) {
    return text || '';
  }

  // Convert to string to ensure we're working with text
  const textStr = String(text);
  
  // Escape special regex characters in search term
  const escapedSearchTerm = escapeRegex(searchTerm);
  
  // Split text by search term (case-insensitive)
  const parts = textStr.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));
  
  const highlighted = parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      // Use theme colors if provided, otherwise fallback to hardcoded values
      const backgroundColor = options?.backgroundColor || 
        (options?.theme ? options.theme.colors.yellow[3] : '#ffeb3b');
      const textColor = options?.textColor || 
        (options?.theme && options?.isDark ? options.theme.colors.yellow[9] : '#000000');
      const shadowColor = options?.theme ? options.theme.colors.yellow[4] : 'rgba(255, 235, 59, 0.5)';
      
      return (
        <mark
          key={index}
          style={{
            backgroundColor,
            borderRadius: '3px',
            boxShadow: `0 0 0 1px ${shadowColor}`,
            color: textColor,
            display: 'inline-block',
            fontWeight: 600,
            lineHeight: 'inherit',
            margin: '0 1px',
            padding: '2px 4px',
          }}
        >
          {part}
        </mark>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });

  return <>{highlighted}</>;
}