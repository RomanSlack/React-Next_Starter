export interface User {
  id: string;
  email: string;
  username?: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  email_verified: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  accent_color: 'apple' | 'orange' | 'neutral' | 'berry' | 'peach';
  notifications: NotificationSettings;
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  desktop_notifications: boolean;
  task_reminders: boolean;
  calendar_reminders: boolean;
  journal_reminders: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  user_id: string;
  is_archived: boolean;
  is_starred?: boolean;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // UI-specific fields (may not come from API)
  completedCards?: number;
  totalCards?: number;
  members?: any[];
  lastActivity?: string;
}

export interface BoardList {
  id: string;
  title: string;
  position: number;
  board_id: string;
  created_at: string;
  updated_at: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  status: string;
  priority: string;
  board_id: string;
  metadata?: Record<string, any>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  board_id: string;
}

export interface ChecklistItem {
  id: string;
  content: string;
  completed: boolean;
  position: number;
  card_id: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  card_id: string;
  uploaded_at: string;
}

export interface Comment {
  id: string;
  content: string;
  card_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  event_type: string;
  color: string;
  metadata?: Record<string, any>;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_all_day: boolean;
  is_recurring: boolean;
}

export interface EventReminder {
  id: string;
  event_id: string;
  remind_at: string;
  method: 'email' | 'push' | 'desktop';
  sent: boolean;
}

export interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'angry' | 'grateful' | 'hopeful' | 'frustrated' | 'content' | 'stressed' | 'other';
  tags: string[];
  metadata?: Record<string, any>;
  entry_date: string;
  is_private: boolean;
  is_favorite: boolean;
  weather?: string;
  location?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AICommand {
  id: string;
  command: string;
  response: string;
  context: Record<string, any>;
  user_id: string;
  created_at: string;
  processing_time: number;
}

export interface AICommandRequest {
  command: string;
  context?: Record<string, any>;
  use_voice?: boolean;
}

export interface DashboardStats {
  total_boards: number;
  total_cards: number;
  completed_cards: number;
  upcoming_events: number;
  recent_journal_entries: number;
  productivity_score: number;
  activity_this_week: ActivityData[];
}

export interface ActivityData {
  date: string;
  boards_created: number;
  cards_completed: number;
  events_added: number;
  journal_entries: number;
}

export interface APIResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface APIError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SearchFilters {
  query?: string;
  board_id?: string;
  date_from?: string;
  date_to?: string;
  labels?: string[];
  assigned_to?: string;
  completed?: boolean;
}

export interface WebSocketMessage {
  type: 'board_update' | 'card_update' | 'calendar_update' | 'notification';
  data: any;
  timestamp: string;
  user_id: string;
}

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
}

export type ViewMode = 'board' | 'list' | 'calendar' | 'timeline';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';
export type SortDirection = 'asc' | 'desc';
export type SortField = 'created_at' | 'updated_at' | 'title' | 'due_date' | 'position';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface DragDropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}