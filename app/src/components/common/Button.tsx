import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-content hover:bg-primary/90 active:bg-primary/95 disabled:bg-primary/40 disabled:text-primary-content/70',
  secondary:
    'bg-secondary text-secondary-content hover:bg-secondary/90 active:bg-secondary/95 disabled:bg-secondary/40',
  ghost:
    'bg-transparent text-base-content hover:bg-base-200 active:bg-base-300 disabled:text-base-content/40',
  danger:
    'bg-accent text-accent-content hover:bg-accent/90 active:bg-accent/95 disabled:bg-accent/40',
  outline:
    'border border-base-300 bg-base-100 text-base-content hover:bg-base-200 active:bg-base-300 disabled:text-base-content/40 disabled:bg-base-100',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-btn
        transition-colors duration-150
        disabled:cursor-not-allowed
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin"
          aria-hidden
        />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span className="truncate">{children}</span>
      {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
