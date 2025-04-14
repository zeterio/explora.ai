import React from 'react';

/**
 * Card props interface
 * @interface CardProps
 */
interface CardProps {
  /** Optional card title */
  title?: string;

  /** Content to be displayed inside the card */
  children: React.ReactNode;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Card component
 *
 * A reusable card component with optional title for displaying grouped content.
 *
 * @example
 * // Basic card
 * <Card>
 *   <p>Card content</p>
 * </Card>
 *
 * @example
 * // Card with title
 * <Card title="Important Information">
 *   <p>This is important content</p>
 * </Card>
 *
 * @example
 * // Card with custom class
 * <Card className="mt-4 max-w-md mx-auto">
 *   <p>Content with custom positioning</p>
 * </Card>
 */
const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 ${className}`}
    >
      {title && <h3 className="mb-4 text-xl font-semibold">{title}</h3>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
