'use client';

import React from 'react';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { useAppStore } from '@/lib/stores/app';
import {
  CommandLineIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const AIPage: React.FC = () => {
  const { setCommandBarOpen } = useAppStore();
  // Real data - empty for production ready state
  const commandHistory: any[] = [];
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
            <p className="mt-1 text-lg text-gray-600">
              Let AI help you manage your tasks and productivity
            </p>
          </div>
          
          <Button
            icon={<CommandLineIcon className="w-5 h-5" />}
            className="bg-grape-600 hover:bg-grape-700"
            onClick={() => setCommandBarOpen(true)}
          >
            Open Command Bar
          </Button>
        </div>
        
        {/* AI Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Smart Suggestions</h3>
                <p className="text-sm text-gray-600">
                  Get AI-powered suggestions for organizing your tasks and projects
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CommandLineIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Voice Commands</h3>
                <p className="text-sm text-gray-600">
                  Use natural language to create tasks, schedule events, and more
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Time Management</h3>
                <p className="text-sm text-gray-600">
                  Get insights on your productivity patterns and time usage
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Command History */}
        <Card>
          <CardHeader title="Command History" />
          <CardContent>
            {commandHistory.length === 0 ? (
              <div className="text-center py-12">
                <CommandLineIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No commands yet</h3>
                <p className="text-gray-500 mb-6">
                  Start using AI commands to see your history here. Press Cmd+K to open the command bar.
                </p>
                <Button
                  icon={<CommandLineIcon className="w-5 h-5" />}
                  className="bg-grape-600 hover:bg-grape-700"
                  onClick={() => setCommandBarOpen(true)}
                >
                  Try Your First Command
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {commandHistory.map((command) => (
                  <div key={command.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-foreground">{command.command}</p>
                      <span className="text-xs text-gray-500">{command.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600">{command.response}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AIPage;