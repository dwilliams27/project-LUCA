import React from 'react';

interface GameHUDProps {
  children: React.ReactNode;
}

export const GameHUD: React.FC<GameHUDProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="shrink-0 w-full h-16 px-6 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex justify-between items-center h-full">
          <div className="text-white font-medium">
            Top stuff
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="shrink-0 w-48 bg-gray-900 border-r border-gray-800 p-4">
          Left stuff
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          {children}
        </div>

        <div className="shrink-0 w-48 bg-gray-900 border-l border-gray-800 p-4">
          Right stuff
        </div>
      </div>

      <div className="w-full h-20 bg-gray-900 border-t border-gray-800 p-4">
        Bottom stuff
      </div>
    </div>
  );
};
