import type { ComponentPropsWithoutRef } from "react";
import React from "react";

import { RawIcons } from "./ui/icon-map";

// Define the icon props type
export type IconProps = {
  size?: number;
  color?: string;
  className?: string;
  stroke?: number;
} & Omit<ComponentPropsWithoutRef<"svg">, "color">;

// Create a type for the Icons object
export type IconsType = {
  [K in keyof typeof RawIcons]: React.FC<IconProps>;
};

/**
 * Memoized icon components for better performance
 * These components won't re-render unless their props change
 *
 * Usage:
 * <Icons.Task size={24} color="blue" />
 */
export const Icons = Object.entries(RawIcons).reduce((acc, [name, Icon]) => {
  acc[name as keyof typeof RawIcons] = React.memo(
    ({ size = 24, color, className, stroke, ...props }: IconProps) => {
      // Ensure Icon is defined
      if (!Icon) {
        console.error(`Icon ${name} is undefined`);
        return null;
      }
      
      return (
        <Icon
          size={size}
          color={color}
          stroke={stroke}
          className={className}
          {...props}
        />
      );
    }
  );
  acc[name as keyof typeof RawIcons].displayName = `Icons.${name}`;
  return acc;
}, {} as IconsType);
