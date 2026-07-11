import React from 'react';
import emptyIcon from '../../assets/empty-image-default.png';

interface EmptyStateProps {
  message?: string;
  description?: string;
  className?: string;
  iconClassName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Sem dados',
  description,
  className = '',
  iconClassName = 'w-24 h-24 opacity-70'
}) => (
  <div className={`flex flex-col items-center justify-center gap-2 text-center text-neutral-500 ${className}`}>
    <img src={emptyIcon} alt="Sem dados" className={iconClassName} />
    <div className="space-y-1 max-w-[26rem]">
      <p className="text-[13px] font-medium text-neutral-400">{message}</p>
      {description ? (
        <p className="text-[12px] text-neutral-400 leading-relaxed">{description}</p>
      ) : null}
    </div>
  </div>
);

export const isDataEmpty = (value: unknown) => {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};
