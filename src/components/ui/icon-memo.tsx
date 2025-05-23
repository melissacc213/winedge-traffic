import { memo, type ComponentPropsWithoutRef, type JSX } from 'react';
import { cn } from '@/lib/utils';

type IconProps = {
  icon: JSX.Element;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  stroke?: number;
} & Omit<ComponentPropsWithoutRef<'div'>, 'color'>;

/**
 * IconMemo - A memoized wrapper for icons to improve performance
 * 
 * This component wraps icons with React.memo to prevent unnecessary re-renders
 * and provides standardized sizing, color, and styling options.
 * 
 * @param icon - The icon component to render
 * @param className - Additional CSS classes to apply
 * @param size - Predefined size or custom number (in pixels)
 * @param color - Color to apply to the icon
 * @param stroke - Stroke width for the icon
 * @param props - Additional HTML div properties
 */
export const IconMemo = memo(function IconMemo({
  icon,
  className,
  size = 'md',
  color,
  stroke,
  ...props
}: IconProps) {
  // Convert named sizes to pixel values
  const sizeMap = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  };
  
  // Calculate the actual size value
  const sizeValue = typeof size === 'string' ? sizeMap[size] : size;
  
  // Clone the icon element with new props
  const styledIcon = icon
    ? {
        ...icon,
        props: {
          ...icon.props,
          className: cn(icon.props.className, className),
          width: sizeValue,
          height: sizeValue,
          ...(color && { color }),
          ...(stroke && { stroke }),
        },
      }
    : null;
  
  return (
    <div 
      {...props}
      className={cn('flex items-center justify-center', className)}
      style={{ 
        width: sizeValue, 
        height: sizeValue,
      }}
    >
      {styledIcon}
    </div>
  );
});

export default IconMemo;