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
import ReactMarkdown from 'react-markdown';

interface VoiceRecorder {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  transcript: string;
}

const useVoiceRecorder = (): VoiceRecorder => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup media recorder and stream
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const transcribeAudio = async (audioBlob: Blob) => {
    console.log('Transcribing audio blob, size:', audioBlob.size);
    
    try {
      // Convert blob to file for the API client
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      
      // Create FormData to send audio file  
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      
      // Get API base URL
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('auth_token');
      
      // Send to backend for transcription
      const response = await fetch(`${baseURL}/api/ai/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Transcription result:', result);
      
      if (result.success && result.transcript) {
        const transcriptText = result.transcript.trim();
        setTranscript(transcriptText);
        console.log('Transcription successful:', transcriptText);
      } else {
        console.error('No transcript received');
        setTranscript('');
      }
      
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      setTranscript('');
    }
  };

  const initializeAudioRecording = async () => {
    try {
      console.log('Initializing audio recording...');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, processing audio...');
        setIsRecording(false);
        
        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        audioChunksRef.current = []; // Clear chunks
        
        // Send to backend for transcription
        transcribeAudio(audioBlob);
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log('Recording started');
        setIsRecording(true);
        setTranscript(''); // Clear previous transcript
        audioChunksRef.current = []; // Clear audio chunks
      };
      
      console.log('Audio recording initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize audio recording:', error);
      return false;
    }
  };

  const startRecording = async () => {
    console.log('Starting voice recording...');
    
    const initialized = await initializeAudioRecording();
    if (!initialized) {
      console.error('Audio recording not available');
      return;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      try {
        mediaRecorderRef.current.start();
        console.log('Audio recording started successfully');
      } catch (error) {
        console.error('Error starting audio recording:', error);
        setIsRecording(false);
      }
    } else {
      console.error('MediaRecorder not available or already recording');
    }
  };

  const stopRecording = () => {
    console.log('Stopping voice recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('Audio recording stopped, processing audio...');
    } else {
      console.error('MediaRecorder not available or not recording');
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

  const toggleVoiceRecording = async () => {
    if (voiceRecorder.isRecording) {
      voiceRecorder.stopRecording();
    } else {
      await voiceRecorder.startRecording();
    }
  };

  const formatToolCalls = (toolCalls: any[]) => {
    if (!toolCalls || toolCalls.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground flex items-center">
          <ClockIcon className="w-4 h-4 mr-2" />
          Actions completed:
        </div>
        {toolCalls.map((call, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
            {call.result?.success ? (
              <CheckCircleIcon className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {call.result?.message || `${call.tool_name} executed`}
              </div>
              {call.result?.result && (
                <div className="text-xs text-muted-foreground mt-1">
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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Welcome to AI Mode
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tell me what you'd like to do and I'll help you create journal entries, schedule events, manage boards, and more.
              </p>
            </div>

            {/* Main Input Card */}
            <Card className="shadow-2xl border border-border bg-card/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="What would you like me to help you with today? (Press Enter to send, Shift+Enter for new line)"
                      className="w-full px-6 py-4 pr-16 border-2 border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent resize-none text-lg placeholder-muted-foreground bg-background text-foreground transition-all duration-200"
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
                          ? 'text-destructive bg-destructive/10 animate-pulse' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                      className="px-8 py-4 bg-accent hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground text-lg font-medium rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
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
                    <div className="inline-flex items-center text-destructive bg-destructive/10 px-4 py-2 rounded-full text-sm">
                      <div className="w-2 h-2 bg-destructive rounded-full animate-pulse mr-2"></div>
                      Recording... Click the mic to stop
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Suggestions */}
            {!result && quickSuggestions.length > 0 && (
              <div className="mt-8 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-4 flex items-center justify-center">
                  <LightBulbIcon className="w-4 h-4 mr-2" />
                  Try these suggestions:
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {quickSuggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => useSuggestion(suggestion)}
                      className="px-4 py-2 bg-background border border-border rounded-xl text-sm text-foreground hover:bg-accent/10 hover:border-accent hover:text-accent transition-all duration-200 shadow-sm"
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
                  result.success ? "border-accent bg-accent/5" : "border-destructive bg-destructive/5"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircleIcon className="w-6 h-6 text-accent mr-3" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-destructive mr-3" />
                        )}
                        <h3 className="text-lg font-semibold text-foreground">
                          {result.success ? 'Task Completed' : 'Error Occurred'}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearResult}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </Button>
                    </div>

                    {/* Response */}
                    <div className="mb-6">
                      <div className="text-foreground leading-relaxed markdown-content">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-base font-medium mb-2 text-foreground">{children}</h4>,
                            p: ({ children }) => <p className="mb-3 text-foreground">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 text-foreground space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 text-foreground space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-foreground">{children}</li>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono">{children}</code>
                              ) : (
                                <code className="block bg-muted p-3 rounded-lg text-sm text-foreground font-mono whitespace-pre-wrap">{children}</code>
                              );
                            },
                            pre: ({ children }) => <pre className="bg-muted p-3 rounded-lg mb-3 overflow-x-auto">{children}</pre>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground mb-3">{children}</blockquote>,
                            a: ({ href, children }) => <a href={href} className="text-accent hover:text-accent/80 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                            hr: () => <hr className="border-border my-4" />,
                          }}
                        >
                          {result.response || ''}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Tool Calls */}
                    {result.tool_calls && result.tool_calls.length > 0 && (
                      <div className="border-t border-border pt-4">
                        {formatToolCalls(result.tool_calls)}
                      </div>
                    )}

                    {/* Error Details */}
                    {result.error && (
                      <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                        <div className="text-sm text-destructive">
                          <strong>Error:</strong> {result.error}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {result.metadata && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                    className="px-6 py-3 border-accent text-accent hover:bg-accent/10"
                  >
                    Try Another Action
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-6">
            <span>Powered by</span>
            
            {/* OpenAI Logo */}
            <div className="flex items-center space-x-2">
              <svg 
                className="w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
              </svg>
              <span className="font-medium">OpenAI</span>
            </div>
            
            <span className="text-muted-foreground/60">and</span>
            
            {/* Serper Logo */}
            <div className="flex items-center space-x-2">
              <svg 
                className="w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="font-medium">Serper</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground/80">
            Seamlessly integrated with your productivity tools
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIModeePage;