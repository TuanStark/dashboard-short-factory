import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-panel rounded-xl p-5 shadow-xl transition-all',
        hoverEffect && 'glass-panel-hover',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
