import React from 'react';

const EmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="macos-glass p-8 text-center">
      <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
        *
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-secondary mb-6">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-4 py-2 rounded-lg bg-accent text-white font-medium">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

