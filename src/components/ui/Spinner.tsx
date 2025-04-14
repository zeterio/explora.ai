/**
 * Spinner Component
 * 
 * Loading indicator with customizable size and color
 */

'use client';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

/**
 * Spinner component for indicating loading states
 * 
 * @param {SpinnerProps} props - Spinner properties
 * @returns Spinner component
 * 
 * @example
 * // Default spinner
 * <Spinner />
 * 
 * @example
 * // Large primary spinner
 * <Spinner size="large" color="primary" />
 */
export function Spinner({ 
  size = 'medium', 
  color = 'primary',
  className = ''
}: SpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3'
  };
  
  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  return (
    <div className={`${className} flex justify-center items-center`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full 
          animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
} 