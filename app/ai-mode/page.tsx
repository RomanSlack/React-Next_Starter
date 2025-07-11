'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  LightBulbIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { aiAPI } from '@/app/lib/api/ai';
import { useAuthStore } from '@/lib/stores/auth';
import { cn } from '@/lib/utils';

interface VoiceRecorder {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  transcript: string;
}

const useVoiceRecorder = (): VoiceRecorder => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    transcript,
  };
};

const AIModeePage: React.FC = () => {
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const voiceRecorder = useVoiceRecorder();

  useEffect(() => {
    // Load quick suggestions on mount
    loadQuickSuggestions();
  }, []);

  useEffect(() => {
    if (voiceRecorder.transcript && !voiceRecorder.isRecording) {
      setInput(voiceRecorder.transcript);
    }
  }, [voiceRecorder.transcript, voiceRecorder.isRecording]);

  const loadQuickSuggestions = async () => {
    try {
      const suggestions = await aiAPI.getQuickSuggestions();
      setQuickSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await aiAPI.sendMessage(messageText.trim());
      setResult(response);
    } catch (error) {
      console.error('Failed to send message:', error);
      setResult({
        success: false,
        response: 'I apologize, but I encountered an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
        tool_calls: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const toggleVoiceRecording = () => {
    if (voiceRecorder.isRecording) {
      voiceRecorder.stopRecording();
    } else {
      voiceRecorder.startRecording();
    }
  };

  const formatToolCalls = (toolCalls: any[]) => {
    if (!toolCalls || toolCalls.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-600 flex items-center">
          <ClockIcon className="w-4 h-4 mr-2" />
          Actions completed:
        </div>
        {toolCalls.map((call, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            {call.result?.success ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {call.result?.message || `${call.tool_name} executed`}
              </div>
              {call.result?.result && (
                <div className="text-xs text-gray-500 mt-1">
                  {JSON.stringify(call.result.result, null, 2)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const clearResult = () => {
    setResult(null);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to AI Mode
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tell me what you'd like to do and I'll help you create journal entries, schedule events, manage boards, and more.
              </p>
            </div>

            {/* Main Input Card */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="What would you like me to help you with today? (Press Enter to send, Shift+Enter for new line)"
                      className="w-full px-6 py-4 pr-16 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none text-lg placeholder-gray-400 transition-all duration-200"
                      rows={4}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleVoiceRecording}
                      className={cn(
                        'absolute right-4 top-4 w-10 h-10 p-0 rounded-xl',
                        voiceRecorder.isRecording 
                          ? 'text-red-500 bg-red-50 animate-pulse' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      )}
                      disabled={isLoading}
                    >
                      <MicrophoneIcon className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 text-lg font-medium rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-5 h-5 mr-3" />
                          Send Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {voiceRecorder.isRecording && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center text-red-500 bg-red-50 px-4 py-2 rounded-full text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      Recording... Click the mic to stop
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Suggestions */}
            {!result && quickSuggestions.length > 0 && (
              <div className="mt-8 text-center">
                <div className="text-sm font-medium text-gray-600 mb-4 flex items-center justify-center">
                  <LightBulbIcon className="w-4 h-4 mr-2" />
                  Try these suggestions:
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {quickSuggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => useSuggestion(suggestion)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 shadow-sm"
                    >
                      <PlayIcon className="w-3 h-3 inline mr-2" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="mt-8">
                <Card className={cn(
                  "shadow-lg transition-all duration-500 transform scale-100",
                  result.success ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-red-500 mr-3" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {result.success ? 'Task Completed' : 'Error Occurred'}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearResult}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </Button>
                    </div>

                    {/* Response */}
                    <div className="mb-6">
                      <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {result.response}
                      </div>
                    </div>

                    {/* Tool Calls */}
                    {result.tool_calls && result.tool_calls.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        {formatToolCalls(result.tool_calls)}
                      </div>
                    )}

                    {/* Error Details */}
                    {result.error && (
                      <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
                        <div className="text-sm text-red-700">
                          <strong>Error:</strong> {result.error}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {result.metadata && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Model: {result.metadata.model} • 
                            Tokens: {result.metadata.tokens_used} • 
                            Time: {result.execution_time_ms}ms
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Try Another Action */}
                <div className="mt-6 text-center">
                  <Button
                    onClick={clearResult}
                    variant="outline"
                    className="px-6 py-3 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Try Another Action
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center text-sm text-gray-500">
          <p>Powered by AI • Seamlessly integrated with your productivity tools</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIModeePage;