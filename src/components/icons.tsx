import { IconMemo } from "./ui/icon-memo";
import React from "react";
import type { ComponentPropsWithoutRef } from "react";
import { RawIcons } from "./ui/icon-map";

// Define the icon props type based on IconMemo props
export type IconProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  color?: string;
  className?: string;
  stroke?: number;
} & Omit<ComponentPropsWithoutRef<"div">, "color">;

// Create a type for the Icons object
export type IconsType = {
  [K in keyof typeof RawIcons]: React.FC<IconProps>;
};

/**
 * Memoized icon components for better performance
 * These components won't re-render unless their props change
 *
 * Usage:
 * <Icons.Task size="md" color="blue" />
 */
export const Icons = Object.entries(RawIcons).reduce((acc, [name, Icon]) => {
  acc[name as keyof typeof RawIcons] = React.memo(
    ({ size, color, className, stroke, ...props }: IconProps) => (
      <IconMemo
        icon={
          <Icon
            size={size}
            color={color}
            stroke={stroke}
            className={className}
          />
        }
        {...props}
      />
    )
  );
  return acc;
}, {} as IconsType);
