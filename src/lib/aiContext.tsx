import { createContext, useContext, useState, type ReactNode } from "react";

export interface AIRequest {
  prompt: string;
  /** Optional structured context — e.g. "A minor pentatonic · fret 5 · string 2" */
  context?: string;
}

interface AIContextValue {
  request: AIRequest | null;
  isOpen: boolean;
  ask: (req: AIRequest) => void;
  close: () => void;
}

const AIContext = createContext<AIContextValue>({
  request: null, isOpen: false,
  ask: () => {}, close: () => {},
});

export function AIProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<AIRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AIContext.Provider value={{
      request, isOpen,
      ask: (req) => { setRequest(req); setIsOpen(true); },
      close: () => setIsOpen(false),
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}
