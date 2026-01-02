
import { Component, signal, input, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { AuthService } from '../services/auth.service';
import { ChatMessage } from '../types';
import { parse } from 'marked';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <!-- Chat Window -->
      @if (isOpen()) {
        <div class="bg-white w-80 md:w-96 h-[500px] shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-slate-200 animate-fade-in-up mb-4">
          <!-- Header -->
          <div class="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <h3 class="font-serif font-semibold">LegalEase Assistant</h3>
            </div>
            <button (click)="toggleChat()" class="text-slate-400 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Messages -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            @for (msg of messages(); track $index) {
              <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                <div [class]="msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'"
                  class="max-w-[85%] px-4 py-2 rounded-2xl shadow-sm text-sm markdown-body"
                  [innerHTML]="renderMarkdown(msg.text)">
                </div>
              </div>
            }
            @if (isLoading()) {
              <div class="flex justify-start">
                <div class="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                  <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            }
          </div>

          <!-- Input -->
          <div class="p-4 bg-white border-t border-slate-100">
            <form (submit)="sendMessage($event)" class="relative">
              <input 
                [(ngModel)]="currentMessage" 
                name="message"
                placeholder="Ask a legal question..." 
                class="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-none placeholder-slate-400"
                [disabled]="isLoading()"
              >
              <button 
                type="submit" 
                [disabled]="!currentMessage.trim() || isLoading()"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      }

      <!-- Toggle Button -->
      <button 
        (click)="toggleChat()" 
        class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
        [class.rotate-90]="isOpen()"
      >
        @if (!isOpen()) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        }
      </button>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.3s ease-out forwards;
    }
    /* Markdown Styles */
    .markdown-body {
      word-wrap: break-word;
    }
    .markdown-body ::ng-deep p { margin-bottom: 0.5em; }
    .markdown-body ::ng-deep p:last-child { margin-bottom: 0; }
    .markdown-body ::ng-deep strong { font-weight: 700; }
    .markdown-body ::ng-deep em { font-style: italic; }
    .markdown-body ::ng-deep ul { list-style-type: disc; padding-left: 1.2em; margin-bottom: 0.5em; }
    .markdown-body ::ng-deep ol { list-style-type: decimal; padding-left: 1.2em; margin-bottom: 0.5em; }
    .markdown-body ::ng-deep li { margin-bottom: 0.2em; }
    .markdown-body ::ng-deep h1, 
    .markdown-body ::ng-deep h2, 
    .markdown-body ::ng-deep h3 { font-weight: 700; margin-bottom: 0.5em; margin-top: 0.5em; font-size: 1.1em; }
    .markdown-body ::ng-deep a { text-decoration: underline; }
    .bg-white .markdown-body ::ng-deep a { color: #2563eb; }
    .bg-blue-600 .markdown-body ::ng-deep a { color: #fff; }
  `]
})
export class ChatWidgetComponent {
  context = input<string>('');
  
  isOpen = signal(false);
  isLoading = signal(false);
  currentMessage = '';

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  geminiService = inject(GeminiService);
  storageService = inject(AuthService);
  messages = this.storageService.chatHistory;

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  async sendMessage(event: Event) {
    event.preventDefault();
    if (!this.currentMessage.trim() || this.isLoading()) return;

    const userMsgText = this.currentMessage;
    this.currentMessage = '';
    
    this.messages.update(msgs => [...msgs, { role: 'user', text: userMsgText }]);
    this.isLoading.set(true);
    this.scrollToBottom();

    const history = this.messages().slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await this.geminiService.chat(userMsgText, history, this.context());
    
    this.messages.update(msgs => [...msgs, { role: 'model', text: response }]);
    this.isLoading.set(false);
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  renderMarkdown(text: string): string {
    try {
      // Configure marked to interpret breaks if necessary, but standard markdown 
      // usually handles standard paragraphs fine.
      return parse(text, { breaks: true }) as string;
    } catch (e) {
      console.error('Markdown rendering failed', e);
      return text;
    }
  }
}
