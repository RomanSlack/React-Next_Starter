import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MicrophoneIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '@/lib/stores/app';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

const CommandBar: React.FC = () => {
  const { commandBarOpen, setCommandBarOpen } = useAppStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandBarOpen(false);
      }
      
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCommandBarOpen]);
  
  // Focus input when opened
  useEffect(() => {
    if (commandBarOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandBarOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // TODO: Process AI command
    console.log('Processing command:', input);
    setInput('');
    setCommandBarOpen(false);
  };
  
  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // TODO: Implement voice recognition
  };
  
  const suggestions = [
    'Create a new board called "Project Alpha"',
    'Schedule a meeting for tomorrow at 2 PM',
    'Add a task to review the quarterly report',
    'Show me my calendar for next week',
    'What tasks are due today?',
  ];
  
  return (
    <AnimatePresence>
      {commandBarOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setCommandBarOpen(false)}
          />
          
          {/* Command Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center border-b border-gray-200 px-6 py-4">
              <SparklesIcon className="w-5 h-5 text-grape-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandBarOpen(false)}
                icon={<XMarkIcon className="w-5 h-5" />}
                className="ml-auto"
              />
            </div>
            
            {/* Input */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="relative">
                <div className="flex items-center">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything or describe what you want to do..."
                    className="w-full pl-10 pr-20 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grape-500 focus:border-grape-500"
                  />
                  
                  <div className="absolute right-3 flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceInput}
                      icon={
                        <MicrophoneIcon
                          className={cn(
                            'w-5 h-5',
                            isListening ? 'text-red-500' : 'text-gray-400'
                          )}
                        />
                      }
                      className={cn(
                        'transition-colors',
                        isListening && 'bg-red-50 hover:bg-red-100'
                      )}
                    />
                    
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!input.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </form>
            
            {/* Suggestions */}
            {!input && (
              <div className="px-6 pb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Try asking:
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">⌘K</kbd> to open • <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { CommandBar };