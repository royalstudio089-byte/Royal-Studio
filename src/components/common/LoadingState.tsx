import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading studio data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
};
