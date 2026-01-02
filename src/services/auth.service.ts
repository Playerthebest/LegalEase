import { Injectable, signal, effect } from '@angular/core';
import { AnalysisRecord, ChatMessage } from '../types';

const ANALYSES_STORAGE_KEY = 'legal_ease_analyses';
const CHAT_HISTORY_STORAGE_KEY = 'legal_ease_chat_history';

@Injectable({
  providedIn: 'root'
})
export class AuthService { // NOTE: Class name is kept for simplicity, but it's now a storage service.
  analyses = signal<AnalysisRecord[]>([]);
  chatHistory = signal<ChatMessage[]>([]);

  constructor() {
    this.loadAnalysesFromStorage();
    this.loadChatHistoryFromStorage();
    
    effect(() => {
      this.saveAnalysesToStorage();
    });

    effect(() => {
      this.saveChatHistoryToStorage();
    });
  }

  private loadAnalysesFromStorage() {
    try {
      const analysesJson = localStorage.getItem(ANALYSES_STORAGE_KEY);
      if (analysesJson) {
        this.analyses.set(JSON.parse(analysesJson));
      }
    } catch (e) {
      console.error('Failed to load analyses from localStorage', e);
      this.analyses.set([]);
    }
  }

  private saveAnalysesToStorage() {
    try {
      localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(this.analyses()));
    } catch (e) {
      console.error('Failed to save analyses to localStorage', e);
    }
  }
  
  private loadChatHistoryFromStorage() {
    try {
      const chatJson = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (chatJson && JSON.parse(chatJson).length > 0) {
        this.chatHistory.set(JSON.parse(chatJson));
      } else {
        this.chatHistory.set([{ role: 'model', text: 'Hello! How can I assist you with your legal documents today?' }]);
      }
    } catch (e) {
      console.error('Failed to load chat history from localStorage', e);
      this.chatHistory.set([{ role: 'model', text: 'Hello! How can I assist you with your legal documents today?' }]);
    }
  }

  private saveChatHistoryToStorage() {
     try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(this.chatHistory()));
    } catch(e) {
      console.error('Failed to save chat history to localStorage', e);
    }
  }

  saveAnalysis(record: AnalysisRecord) {
    this.analyses.update(analyses => [record, ...analyses]);
  }

  clearAllData() {
    this.analyses.set([]);
    this.chatHistory.set([{ role: 'model', text: 'Hello! How can I assist you with your legal documents today?' }]);
  }

  // FIX: Add mock login and signup methods to resolve compilation errors in AuthComponent.
  login(username: string, password: string): { success: boolean, message: string } {
    if (username && password) {
      // This is a mock implementation. In a real app, it would handle user state.
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid username or password' };
  }

  signup(username: string, password: string): { success: boolean, message: string } {
    if (username && password) {
      // This is a mock implementation. In a real app, it would create a user.
      return { success: true, message: 'Signup successful' };
    }
    return { success: false, message: 'Please provide a username and password' };
  }
}
