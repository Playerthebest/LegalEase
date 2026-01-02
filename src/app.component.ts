
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisComponent } from './components/analysis.component';
import { ChatWidgetComponent } from './components/chat-widget.component';
import { DashboardComponent } from './components/dashboard.component';
import { AnalysisRecord } from './types';

type ViewState = 'dashboard' | 'analysis';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AnalysisComponent, ChatWidgetComponent, DashboardComponent],
  template: `
    <main>
      @switch (currentView()) {
        @case ('dashboard') {
          <app-dashboard (viewAnalysis)="handleViewAnalysis($event)" />
        }
        @case ('analysis') {
          <app-analysis [record]="currentAnalysis()" (goBack)="goToDashboard()" />
        }
      }
    </main>
    
    <app-chat-widget [context]="chatContext()" />
  `
})
export class AppComponent {
  currentView = signal<ViewState>('dashboard');
  currentAnalysis = signal<AnalysisRecord | null>(null);
  chatContext = signal<string>('');

  handleViewAnalysis(record: AnalysisRecord) {
    this.currentAnalysis.set(record);
    this.updateChatContext(record);
    this.currentView.set('analysis');
  }

  goToDashboard() {
    this.currentView.set('dashboard');
    this.currentAnalysis.set(null);
    this.chatContext.set('');
  }
  
  private updateChatContext(record: AnalysisRecord | null) {
    if (!record || !record.analysisResult) {
      this.chatContext.set('');
      return;
    }
    const contextStr = `
      The user is viewing an analysis for the document: "${record.title}".
      Overall Risk Score: ${record.analysisResult.overallRiskScore}/100.
      Summary: ${record.analysisResult.summary}.
      Key Clauses Analyzed: ${record.analysisResult.clauses.length}.
      Please answer questions specific to this document's risks.
    `;
    this.chatContext.set(contextStr);
  }
}
