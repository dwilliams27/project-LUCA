import { PromptCatalog } from '@/ai/PromptCatalog';
import { GEN_PROCESS } from '@/ai/prompts/generators';
import { MenuButton } from '@/components/ui/MenuButton';
import '@/systems/PSE/TestRendererDeepseek';
import React from 'react';

export interface MainMenuProps {
  onStart: () => void
};

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const handleQuit = () => {
    window.Electron?.ipcRenderer.send('quit-app');
  };

  const handleGenerateText = async () => {
    // @ts-ignore
    // const result = await window.electronApi.generateText(PromptCatalog.getPopulatedPrompt(GEN_PROCESS, { PROCESS_DESCRIPTION: 'Generate a basic metabolic process for early-stage cells that consumes matter and produces energy.' }));
    // console.log(result);
  };

  // const MenuButton = ({ onClick, children }) => (
  //   <button
  //     onClick={onClick}
  //     className="relative group w-64 h-16 mb-4 bg-emerald-800 text-emerald-100 rounded-lg 
  //       overflow-hidden transition-all duration-300 hover:bg-emerald-700"
  //   >
  //     <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
  //       {[...Array(6)].map((_, i) => (
  //         <div
  //           key={i}
  //           className="absolute w-16 h-16 bg-emerald-300 rounded-full blur-xl"
  //           style={{
  //             left: `${(i * 30) - 20}%`,
  //             top: `${Math.sin(i) * 100}%`,
  //           }}
  //         />
  //       ))}
  //     </div>

  //     <div className="relative flex items-center justify-center w-full h-full">
  //       <span className="text-xl font-semibold tracking-wide">{children}</span>
  //       <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-300 rounded-full" />
  //       <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-300 rounded-full" />
  //     </div>
  //   </button>
  // );

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900 bg-evolution">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 bg-emerald-500 rounded-full blur-3xl animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="mb-16 text-center">
        <h1 className="text-6xl font-bold text-emerald-100 mb-2">Project LUCA</h1>
        <p className="text-emerald-400 text-lg italic">Climb Darwin's ladder</p>
      </div>

      <div className="flex flex-col items-center z-10">
        <MenuButton
          onClick={() => {
            onStart();
          }
        }>
          Start Evolution
        </MenuButton>
        <MenuButton onClick={handleQuit}>
          Terminate Process
        </MenuButton>
      </div>

      <div className="absolute bottom-4 right-4 text-emerald-600 font-mono text-sm">
        v0.1.0α
      </div>
    </div>
  );
};
