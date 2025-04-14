import React from 'react';

/**
 * Button props interface
 * @interface ButtonProps
 */
interface ButtonProps {
  /** Content to be displayed within the button */
  children: React.ReactNode;

  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline';

  /** Button size */
  size?: 'sm' | 'md' | 'lg';

  /** Click handler function */
  onClick?: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Button component
 *
 * A customizable button component with different variants and sizes.
 *
 * @example
 * // Primary button (default)
 * <Button>Click me</Button>
 *
 * @example
 * // Secondary button, large size
 * <Button variant="secondary" size="lg">Submit</Button>
 *
 * @example
 * // Outline button with click handler
 * <Button variant="outline" onClick={() => console.log('Clicked')}>Cancel</Button>
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
    secondary:
      'bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-400',
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-11 px-6 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};

export default Button;
