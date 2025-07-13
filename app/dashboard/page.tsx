'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  BookOpenIcon,
  TrophyIcon,
  ListBulletIcon,
  MicrophoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useAuthStore } from '@/lib/stores/auth';
import { cn } from '@/lib/utils';
import { questAPI, Quest, QuestDay } from '@/app/lib/api/quest';
import { calendarAPI } from '@/app/lib/api/calendar';
import { journalAPI } from '@/app/lib/api/journal';
import { aiAPI } from '@/app/lib/api/ai';
import { CalendarEvent, JournalEntry } from '@/types';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalQuests: 0,
    completedQuests: 0,
    pendingQuests: 0,
    upcomingEvents: 0,
    journalEntries: 0,
  });
  
  const [todayQuests, setTodayQuests] = useState<Quest[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [recentJournalEntries, setRecentJournalEntries] = useState<JournalEntry[]>([]);
  const [questHeatmapData, setQuestHeatmapData] = useState<{ [date: string]: number }>({});
  const [heatmapView, setHeatmapView] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState(false);
  
  // Quick Add Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quickAddStatus, setQuickAddStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
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
        setQuickAddStatus('processing');
        
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range for heatmap (last 12 months like GitHub)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      // Fetch all data in parallel
      const [questsResponse, questArchiveResponse, eventsResponse, journalResponse, journalStatsResponse] = await Promise.allSettled([
        questAPI.getTodayQuests(),
        questAPI.getQuestArchive({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          limit: 100
        }),
        calendarAPI.getUpcomingEvents(5),
        journalAPI.getEntries(1, 5),
        journalAPI.getStats()
      ]);

      // Process quests data
      if (questsResponse.status === 'fulfilled') {
        const questDay = questsResponse.value;
        setTodayQuests(questDay.quests || []);
        setStats(prev => ({ 
          ...prev, 
          totalQuests: questDay.total_count || 0,
          completedQuests: questDay.completed_count || 0,
          pendingQuests: questDay.pending_count || 0
        }));
      }

      // Process quest archive for heatmap
      if (questArchiveResponse.status === 'fulfilled') {
        const archive = questArchiveResponse.value;
        const heatmapData: { [date: string]: number } = {};
        
        if (archive.days) {
          archive.days.forEach((day: any) => {
            heatmapData[day.date] = day.completed_count || 0;
          });
        }
        
        setQuestHeatmapData(heatmapData);
      }

      // Process events data
      if (eventsResponse.status === 'fulfilled') {
        const events = eventsResponse.value || [];
        setUpcomingEvents(events);
        setStats(prev => ({ ...prev, upcomingEvents: events.length }));
      }

      // Process journal data
      if (journalResponse.status === 'fulfilled') {
        const entries = journalResponse.value.items || [];
        setRecentJournalEntries(entries);
      }

      if (journalStatsResponse.status === 'fulfilled') {
        const journalStats = journalStatsResponse.value;
        setStats(prev => ({ 
          ...prev, 
          journalEntries: journalStats.total_entries || 0
        }));
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    console.log('Quick Add clicked, current status:', quickAddStatus);
    
    if (quickAddStatus === 'idle') {
      const initialized = await initializeAudioRecording();
      if (!initialized) {
        console.error('Audio recording not available');
        setQuickAddStatus('error');
        setTimeout(() => setQuickAddStatus('idle'), 2000);
        return;
      }
      startVoiceRecording();
    } else if (quickAddStatus === 'recording') {
      stopVoiceRecording();
    }
  };

  const startVoiceRecording = () => {
    console.log('Starting voice recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      try {
        setQuickAddStatus('recording');
        mediaRecorderRef.current.start();
        console.log('Audio recording started successfully');
      } catch (error) {
        console.error('Error starting audio recording:', error);
        setQuickAddStatus('error');
        setIsRecording(false);
        setTimeout(() => setQuickAddStatus('idle'), 2000);
      }
    } else {
      console.error('MediaRecorder not available or already recording');
    }
  };

  const stopVoiceRecording = () => {
    console.log('Stopping voice recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('Audio recording stopped, processing audio...');
    } else {
      console.error('MediaRecorder not available or not recording');
    }
  };

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
        
        // Process the transcribed text with AI
        processVoiceInput(transcriptText);
      } else {
        console.error('No transcript received');
        setQuickAddStatus('error');
        setTimeout(() => {
          setQuickAddStatus('idle');
          setTranscript('');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      setQuickAddStatus('error');
      setTimeout(() => {
        setQuickAddStatus('idle');
        setTranscript('');
      }, 2000);
    }
  };

  const processVoiceInput = async (voiceText: string) => {
    console.log('Processing voice input:', voiceText);
    
    if (!voiceText.trim()) {
      console.log('Empty voice input');
      setQuickAddStatus('error');
      setTimeout(() => {
        setQuickAddStatus('idle');
        setTranscript('');
      }, 2000);
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Sending to AI API:', voiceText.trim());
      const response = await aiAPI.sendMessage(voiceText.trim());
      console.log('AI API response:', response);
      
      // Check response like the AI page does
      if (response && !response.error && response.response) {
        console.log('AI processing successful, response:', response.response);
        setQuickAddStatus('success');
        // Refresh dashboard data to show new content
        setTimeout(async () => {
          await fetchDashboardData();
        }, 500);
      } else {
        console.log('AI API returned failure:', response?.error || 'No response');
        setQuickAddStatus('error');
      }
    } catch (error) {
      console.error('Failed to process voice input:', error);
      setQuickAddStatus('error');
    } finally {
      setIsProcessing(false);
      // Reset to idle after showing status for 2 seconds
      setTimeout(() => {
        setQuickAddStatus('idle');
        setTranscript('');
      }, 2000);
    }
  };

  const handleToggleQuest = async (questId: string, isComplete: boolean) => {
    try {
      await questAPI.toggleQuestComplete(questId, isComplete);
      await fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle quest:', error);
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'bg-accent';
      case 'good': return 'bg-accent/80';
      case 'okay': return 'bg-accent/60';
      case 'bad': return 'bg-accent/40';
      case 'terrible': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const getHeatmapColor = (completedCount: number) => {
    if (completedCount === 0) return 'bg-muted';
    if (completedCount === 1) return 'bg-accent/20';
    if (completedCount === 2) return 'bg-accent/40';
    if (completedCount >= 3 && completedCount <= 4) return 'bg-accent/60';
    if (completedCount >= 5 && completedCount <= 6) return 'bg-accent/80';
    return 'bg-accent'; // 7+ completed quests
  };

  const generateHeatmapData = () => {
    const today = new Date();
    
    if (heatmapView === 'month') {
      // Current month view
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // Start from Sunday before the month begins
      const start = new Date(startOfMonth);
      start.setDate(start.getDate() - start.getDay());
      
      // End on Saturday after the month ends
      const end = new Date(endOfMonth);
      end.setDate(end.getDate() + (6 - end.getDay()));
      
      const weeks = [];
      let currentWeek = [];
      
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const completedCount = questHeatmapData[dateStr] || 0;
        const isCurrentMonth = current.getMonth() === today.getMonth();
        
        currentWeek.push({
          date: dateStr,
          completedCount,
          isToday: current.toDateString() === today.toDateString(),
          dayOfWeek: current.getDay(),
          dayOfMonth: current.getDate(),
          month: current.getMonth(),
          year: current.getFullYear(),
          isCurrentMonth
        });
        
        // Complete week (Sunday to Saturday)
        if (current.getDay() === 6) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      return { 
        weeks, 
        months: [{ 
          month: today.getMonth(), 
          weekIndex: 0, 
          name: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }] 
      };
    } else {
      // Year view (simplified for container fit)
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      const start = new Date(startDate);
      start.setDate(start.getDate() - start.getDay());
      
      const weeks = [];
      const months = [];
      let currentWeek = [];
      let currentMonth = start.getMonth();
      let weekIndex = 0;
      
      const current = new Date(start);
      while (current <= today) {
        const dateStr = current.toISOString().split('T')[0];
        const completedCount = questHeatmapData[dateStr] || 0;
        
        if (current.getMonth() !== currentMonth) {
          months.push({
            month: currentMonth,
            weekIndex: weekIndex,
            name: new Date(current.getFullYear(), currentMonth).toLocaleDateString('en-US', { month: 'short' })
          });
          currentMonth = current.getMonth();
        }
        
        currentWeek.push({
          date: dateStr,
          completedCount,
          isToday: current.toDateString() === today.toDateString(),
          dayOfWeek: current.getDay(),
          dayOfMonth: current.getDate(),
          month: current.getMonth(),
          year: current.getFullYear(),
          isCurrentMonth: true
        });
        
        if (current.getDay() === 6) {
          weeks.push([...currentWeek]);
          currentWeek = [];
          weekIndex++;
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }
      
      return { weeks, months };
    }
  };

  const { weeks, months } = generateHeatmapData();
  
  // Add custom CSS for sound wave animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .soundwave-1 { animation: soundwave 0.8s ease-in-out infinite; }
      .soundwave-2 { animation: soundwave 0.8s ease-in-out infinite 0.1s; }
      .soundwave-3 { animation: soundwave 0.8s ease-in-out infinite 0.2s; }
      .soundwave-4 { animation: soundwave 0.8s ease-in-out infinite 0.3s; }
      .soundwave-5 { animation: soundwave 0.8s ease-in-out infinite 0.4s; }
      
      @keyframes soundwave {
        0%, 100% { transform: scaleY(0.5); opacity: 0.7; }
        50% { transform: scaleY(1.5); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  const totalContributions = heatmapView === 'month' 
    ? Object.entries(questHeatmapData)
        .filter(([date]) => {
          const d = new Date(date);
          const today = new Date();
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        })
        .reduce((sum, [, count]) => sum + count, 0)
    : Object.values(questHeatmapData).reduce((sum, count) => sum + count, 0);
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Here's your quest progress and what's planned for today.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleQuickAdd}
              disabled={loading || isProcessing}
              className={cn(
                'relative group px-6 py-3 rounded-2xl font-medium text-white transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 shadow-lg',
                quickAddStatus === 'idle' && 'bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-800 hover:from-slate-800 hover:via-blue-800 hover:to-indigo-900',
                quickAddStatus === 'recording' && 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse',
                quickAddStatus === 'processing' && 'bg-gradient-to-r from-yellow-500 to-orange-500',
                quickAddStatus === 'success' && 'bg-gradient-to-r from-blue-500 to-blue-600',
                quickAddStatus === 'error' && 'bg-gradient-to-r from-red-500 to-red-600'
              )}
            >
              
              {/* Content */}
              <div className="relative flex items-center space-x-2">
                {quickAddStatus === 'idle' && (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    <span>Quick Add</span>
                  </>
                )}
                
                {quickAddStatus === 'recording' && (
                  <>
                    <div className="relative flex items-center">
                      <MicrophoneIcon className="w-5 h-5 mr-2" />
                      {/* Sound wave animation */}
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-3 bg-white rounded-full soundwave-1" />
                        <div className="w-1 h-4 bg-white rounded-full soundwave-2" />
                        <div className="w-1 h-2 bg-white rounded-full soundwave-3" />
                        <div className="w-1 h-5 bg-white rounded-full soundwave-4" />
                        <div className="w-1 h-3 bg-white rounded-full soundwave-5" />
                      </div>
                    </div>
                    <span>Listening...</span>
                  </>
                )}
                
                {quickAddStatus === 'processing' && (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                )}
                
                {quickAddStatus === 'success' && (
                  <>
                    <CheckIcon className="w-5 h-5 text-white" />
                    <span>Done!</span>
                  </>
                )}
                
                {quickAddStatus === 'error' && (
                  <>
                    <XMarkIcon className="w-5 h-5" />
                    <span>Failed</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <ListBulletIcon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Quests</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalQuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.completedQuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingQuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Events</p>
                  <p className="text-2xl font-bold text-foreground">{stats.upcomingEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Quests */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Today's Quests"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/quest')}>
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className={cn(
                "space-y-3",
                todayQuests.length > 5 && "max-h-80 overflow-y-auto pr-2 quest-scrollbar"
              )}>
                {todayQuests.length === 0 ? (
                  <div className="text-center py-8">
                    <ListBulletIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No quests for today</p>
                    <p className="text-sm text-muted-foreground/70">Add your first quest to get started</p>
                    <Button 
                      className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="sm"
                      onClick={() => router.push('/quest')}
                      disabled={loading}
                    >
                      Add Quest
                    </Button>
                  </div>
                ) : (
                  todayQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <button
                        onClick={() => handleToggleQuest(quest.id, !quest.is_complete)}
                        className={cn(
                          'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                          quest.is_complete
                            ? 'bg-accent border-accent text-white'
                            : 'border-muted-foreground hover:border-accent'
                        )}
                      >
                        {quest.is_complete && (
                          <CheckCircleIcon className="w-3 h-3" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          quest.is_complete 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                        )}>
                          {quest.content}
                        </p>
                        {quest.date_due && (
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Due: {new Date(quest.date_due).toLocaleDateString()}
                            {quest.time_due && ` at ${quest.time_due}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Quest Activity Heatmap */}
          <Card>
            <CardHeader
              title="Quest Activity"
              action={
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setHeatmapView('month')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      heatmapView === 'month' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setHeatmapView('year')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      heatmapView === 'year' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Year
                  </button>
                </div>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {/* Contribution count */}
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalContributions}</span> quests completed in the {heatmapView === 'month' ? 'current month' : 'last year'}
                </div>

                {/* Heatmap container with controlled width */}
                <div className="relative overflow-hidden">
                  {/* Month/Year label */}
                  {heatmapView === 'month' && (
                    <div className="mb-2 text-center">
                      <h3 className="text-lg font-semibold text-foreground">{months[0]?.name}</h3>
                    </div>
                  )}

                  {/* Month labels for year view */}
                  {heatmapView === 'year' && (
                    <div className="flex justify-between mb-1 text-xs text-muted-foreground overflow-hidden">
                      {months.filter((_, index) => index % 3 === 0).map((monthData) => (
                        <span key={`${monthData.month}-${monthData.weekIndex}`}>
                          {monthData.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Main grid container */}
                  <div className="flex overflow-x-auto pb-2">
                    {/* Day of week labels */}
                    <div className="flex flex-col justify-around text-xs text-muted-foreground mr-2 flex-shrink-0" style={{ height: '84px' }}>
                      <div></div> {/* Sunday - empty */}
                      <div>Mon</div>
                      <div></div> {/* Tuesday - empty */}
                      <div>Wed</div>
                      <div></div> {/* Thursday - empty */}
                      <div>Fri</div>
                      <div></div> {/* Saturday - empty */}
                    </div>

                    {/* Heatmap grid */}
                    <div className="flex gap-1 flex-shrink-0">
                      {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {week.map((day, dayIndex) => (
                            <div
                              key={day ? day.date : `empty-${weekIndex}-${dayIndex}`}
                              className={cn(
                                heatmapView === 'month' ? 'w-4 h-4' : 'w-2.5 h-2.5',
                                'rounded-sm transition-all duration-200 cursor-pointer',
                                day ? getHeatmapColor(day.completedCount) : 'bg-transparent',
                                day && !day.isCurrentMonth && heatmapView === 'month' && 'opacity-30',
                                day?.isToday && 'ring-1 ring-accent',
                                day && 'hover:ring-1 hover:ring-muted-foreground'
                              )}
                              title={day ? `${day.date}: ${day.completedCount} quests completed` : ''}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex items-center gap-1 ml-1">
                      <div className={cn(heatmapView === 'month' ? 'w-4 h-4' : 'w-2.5 h-2.5', 'bg-muted rounded-sm border border-border')}></div>
                      <div className={cn(heatmapView === 'month' ? 'w-4 h-4' : 'w-2.5 h-2.5', 'bg-accent/20 rounded-sm')}></div>
                      <div className={cn(heatmapView === 'month' ? 'w-4 h-4' : 'w-2.5 h-2.5', 'bg-accent/40 rounded-sm')}></div>
                      <div className={cn(heatmapView === 'month' ? 'w-4 h-4' : 'w-2.5 h-2.5', 'bg-accent/60 rounded-sm')}></div>
                      <div className={cn(heatmapView === 'month' ? 'w-4 h-4' : 'w-2.5 h-2.5', 'bg-accent/80 rounded-sm')}></div>
                      <div className={cn(heatmapView === 'month' ? 'w-4 h-4' : 'w-2.5 h-2.5', 'bg-accent rounded-sm')}></div>
                    </div>
                    <span className="ml-1">More</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader
              title="Upcoming Events"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/calendar')}>
                  View Calendar
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No upcoming events</p>
                    <p className="text-sm text-muted-foreground/70">Schedule events to see them here</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => {
                    const eventDate = new Date(event.start_datetime);
                    const dateStr = eventDate.toLocaleDateString();
                    const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={event.id} className="flex items-center space-x-3">
                        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', event.color || 'bg-accent')}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dateStr} at {timeStr}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Journal Entries */}
          <Card>
            <CardHeader
              title="Recent Journal Entries"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/journal')}>
                  View Journal
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {recentJournalEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpenIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No journal entries</p>
                    <p className="text-sm text-muted-foreground/70">Start journaling to track your thoughts and mood</p>
                  </div>
                ) : (
                  recentJournalEntries.map((entry) => {
                    const entryDate = new Date(entry.entry_date || entry.created_at);
                    const dateStr = entryDate.toLocaleDateString();
                    
                    return (
                      <div key={entry.id} className="flex items-center space-x-3">
                        <div className={cn('w-3 h-3 rounded-full flex-shrink-0', getMoodColor(entry.mood || 'okay'))}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {entry.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{dateStr}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;