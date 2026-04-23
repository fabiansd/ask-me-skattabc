import React from 'react';

type Size = 'xs' | 'sm' | 'md';
type Variant = 'ghost' | 'subtle' | 'filled';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: Size;
  variant?: Variant;
}

const sizeClasses: Record<Size, string> = {
  xs: 'h-7 w-7',
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
};

const variantClasses: Record<Variant, string> = {
  ghost: 'text-base-content/70 hover:text-base-content hover:bg-base-200',
  subtle:
    'bg-base-200 text-base-content/80 border border-base-300 hover:bg-base-300 hover:text-base-content',
  filled: 'bg-primary text-primary-content hover:bg-primary/90',
};

export default function IconButton({
  label,
  size = 'sm',
  variant = 'ghost',
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-btn
        transition-colors duration-150
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
