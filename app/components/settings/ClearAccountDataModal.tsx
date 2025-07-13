'use client';

import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { authAPI } from '@/app/lib/api/auth';
import { useAuthStore } from '@/app/lib/stores/auth';

interface ClearAccountDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClearAccountDataModal: React.FC<ClearAccountDataModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'confirm' | 'verify'>('confirm');
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { logout } = useAuthStore();
  
  const handleClose = () => {
    if (!isLoading) {
      setStep('confirm');
      setPassword('');
      setConfirmationText('');
      setError('');
      onClose();
    }
  };
  
  const handleProceedToVerify = () => {
    setError('');
    setStep('verify');
  };
  
  const handleGoBack = () => {
    setStep('confirm');
    setError('');
  };
  
  const handleClearData = async () => {
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    if (confirmationText !== 'DELETE MY DATA') {
      setError('Please type "DELETE MY DATA" exactly to confirm');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authAPI.clearAccountData(password, confirmationText);
      
      // Show success message briefly then logout and redirect
      setTimeout(() => {
        logout();
        window.location.href = '/auth/login?message=data-cleared';
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to clear account data. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (step === 'confirm') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Clear Account Data"
        description="This will permanently delete all your data"
        size="md"
        closeOnOverlayClick={!isLoading}
        closeOnEscape={!isLoading}
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">
                This action cannot be undone
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete all of your:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                <li>Kanban boards and cards</li>
                <li>Calendar events</li>
                <li>Journal entries</li>
                <li>AI command history</li>
                <li>All active sessions (you'll be logged out everywhere)</li>
              </ul>
              <p className="text-sm text-red-700 mt-3 font-medium">
                Your account will remain active, but all data will be lost forever.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you absolutely sure you want to clear all your account data?
            </p>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                This action will:
              </h4>
              <ul className="text-sm text-foreground space-y-1">
                <li>• Delete all your boards, cards, and tasks</li>
                <li>• Remove all calendar events and reminders</li>
                <li>• Erase all journal entries and mood data</li>
                <li>• Clear your AI conversation history</li>
                <li>• Log you out of all devices</li>
                <li>• Reset your preferences to default</li>
              </ul>
            </div>
          </div>
        </div>
        
        <ModalFooter align="between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleProceedToVerify}
            disabled={isLoading}
          >
            I Understand, Continue
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Verify Account Data Clearing"
      description="Enter your password and confirmation text"
      size="md"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-6">
        <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800">
              Final Verification Required
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Please enter your password and the exact confirmation text to proceed.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your current password"
            disabled={isLoading}
            autoFocus
          />
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirmation Text
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Type <span className="font-mono font-semibold text-red-600">DELETE MY DATA</span> exactly:
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE MY DATA"
              disabled={isLoading}
              className={confirmationText === 'DELETE MY DATA' ? 'border-green-300' : ''}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                Clearing your account data...
              </p>
              <p className="text-sm text-blue-600 mt-1">
                This may take a few moments. Please don't close this window.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <ModalFooter align="between">
        <Button
          variant="outline"
          onClick={handleGoBack}
          disabled={isLoading}
        >
          Go Back
        </Button>
        <Button
          variant="destructive"
          onClick={handleClearData}
          disabled={
            isLoading || 
            !password.trim() || 
            confirmationText !== 'DELETE MY DATA'
          }
          loading={isLoading}
        >
          {isLoading ? 'Clearing Data...' : 'Clear All Data'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ClearAccountDataModal;