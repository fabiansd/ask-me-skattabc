import React from 'react';

type Variant = 'surface' | 'elevated' | 'subtle';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  as?: keyof JSX.IntrinsicElements;
}

const variantClasses: Record<Variant, string> = {
  surface: 'bg-base-100 border border-base-300',
  elevated: 'bg-base-100 border border-base-300 shadow-card',
  subtle: 'bg-base-200 border border-base-300/70',
};

export default function Card({
  variant = 'surface',
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: CardProps) {
  const Component = Tag as React.ElementType;
  return (
    <Component
      {...rest}
      className={`rounded-box ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Component>
  );
}
