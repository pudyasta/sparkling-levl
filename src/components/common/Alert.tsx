import { useRef, useState, useEffect } from '@lynx-js/react';

type AlertProps = {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
};

export const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses =
    'p-4 rounded-xl shadow-md w-full flex items-center justify-between transition-opacity duration-300';
  const typeClasses =
    type === 'error'
      ? 'bg-red-100 border border-red-400 text-red-700'
      : 'bg-green-100 border border-green-400 text-green-700';
  const icon = type === 'error' ? '❌' : '✅';

  return (
    <view className={`${baseClasses} ${typeClasses}`}>
      <view className="flex items-center">
        <text className="text-xl mr-3">{icon}</text>
        <text className="text-sm font-medium">{message}</text>
      </view>
      <text
        bindtap={onClose}
        className={`ml-4 p-1 rounded-full opacity-75 hover:opacity-100 transition ${type === 'error' ? 'text-red-700' : 'text-green-700'}`}
        aria-label="Close alert"
      >
        tutup
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg> */}
      </text>
    </view>
  );
};
