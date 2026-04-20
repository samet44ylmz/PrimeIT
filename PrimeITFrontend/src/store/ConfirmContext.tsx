import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleClose = (result: boolean) => {
    if (modalState) {
      modalState.resolve(result);
      setModalState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modalState?.isOpen && (
        <ConfirmationModal 
          options={modalState.options} 
          onClose={handleClose} 
        />
      )}
    </ConfirmContext.Provider>
  );
};

// Internal Modal Component to avoid circular deps if needed, 
// but we'll import it or define it here for simplicity in this project.
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal: React.FC<{ options: ConfirmOptions; onClose: (res: boolean) => void }> = ({ options, onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center px-6 bg-black/90 backdrop-blur-md fade-in">
      <div className="bg-[#0A0A0C] border border-white/10 w-full max-w-md rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-float-in">
        <div className="p-8 border-b border-white/5 flex flex-col items-center text-center gap-4">
             <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
             </div>
             <div>
                <h3 className="m-title text-2xl uppercase tracking-tight">{options.title || 'DİKKAT'}</h3>
                <p className="m-label text-white/30 text-[10px] mt-1 uppercase tracking-widest">Kritik İşlem Onayı</p>
             </div>
        </div>
        
        <div className="p-10 text-center">
            <p className="text-white/70 text-lg leading-relaxed">
                {options.message}
            </p>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
            <button 
                onClick={() => onClose(false)}
                className="flex-1 m-btn-secondary !py-4 !text-xs"
            >
                {options.cancelLabel || 'VAZGEÇ'}
            </button>
            <button 
                onClick={() => onClose(true)}
                className="flex-1 m-btn-primary !bg-red-500 !shadow-red-500/20 hover:!shadow-red-500/40 !py-4 !text-xs"
            >
                {options.confirmLabel || 'DEVAM ET'}
            </button>
        </div>
      </div>
    </div>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
