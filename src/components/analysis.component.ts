
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisRecord } from '../types';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (record(); as rec) {
      <div class="min-h-screen bg-slate-50 pb-20">
        <!-- Top Bar -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button (click)="goBack.emit()" class="text-slate-500 hover:text-blue-600 transition flex items-center gap-1 font-medium text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
              </button>
              <span class="h-5 w-px bg-slate-300"></span>
              <h1 class="font-serif font-bold text-xl text-slate-800 truncate" [title]="rec.title">{{ rec.title }}</h1>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Jurisdiction:</span>
              <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md">{{ rec.jurisdiction }}</span>
            </div>
          </div>
        </header>

        <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <!-- Score & Summary Card -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
              <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Overall Risk Score</h3>
              <div class="relative w-40 h-40 flex items-center justify-center">
                <svg class="w-full h-full" viewBox="0 0 36 36">
                  <path class="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" />
                  <path [attr.stroke-dasharray]="rec.analysisResult?.overallRiskScore + ', 100'" [class]="getScoreColor(rec.analysisResult?.overallRiskScore ?? 0)" class="animate-progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3" stroke-linecap="round" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-4xl font-serif font-bold text-slate-800">{{ rec.analysisResult?.overallRiskScore }}</span>
                  <span class="text-xs font-medium text-slate-400">/ 100</span>
                </div>
              </div>
              <p class="mt-4 text-sm font-medium" [class]="getScoreTextColor(rec.analysisResult?.overallRiskScore ?? 0)">{{ getScoreLabel(rec.analysisResult?.overallRiskScore ?? 0) }}</p>
            </div>
            <div class="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Executive Summary</h3>
              <p class="text-slate-700 leading-relaxed">{{ rec.analysisResult?.summary }}</p>
            </div>
          </div>

          <!-- Clauses List -->
          <div>
            <div class="flex items-center justify-between mb-6"><h2 class="text-2xl font-serif font-bold text-slate-900">Analyzed Clauses</h2><span class="text-sm text-slate-500">Sorted by Risk: High to Low</span></div>
            <div class="space-y-4">
              @for (clause of rec.analysisResult?.clauses; track $index) {
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition duration-200">
                  <div class="px-6 py-4 flex items-start justify-between gap-4 cursor-pointer" (click)="toggleClause($index)">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-1">
                        <h3 class="font-bold text-lg text-slate-800">{{ clause.title }}</h3>
                        <span [class]="getBadgeClass(clause.riskLevel)" class="text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide">{{ clause.riskLevel }} Risk</span>
                      </div>
                      <p class="text-slate-600 text-sm line-clamp-2" [class.line-clamp-none]="isExpanded($index)">{{ clause.laymanExplanation }}</p>
                    </div>
                    <button class="text-slate-400 mt-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform transition-transform" [class.rotate-180]="isExpanded($index)" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                  </div>
                  @if (isExpanded($index)) {
                    <div class="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
                      <div class="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Original Text Snippet</h4>
                          <div class="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 border border-slate-200 italic leading-relaxed">"{{ clause.originalText }}"</div>
                        </div>
                        <div>
                          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Risk Analysis</h4>
                          <p class="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100"><span class="font-bold">Why it's risky:</span> {{ clause.riskReason }}</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          
          <!-- Original Full Text -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 flex items-center justify-between cursor-pointer" (click)="toggleOriginalText()">
              <h2 class="text-xl font-serif font-bold text-slate-900">Original Document Text</h2>
              @if(rec.isExample && rec.sourceUrl) {
                <a [href]="rec.sourceUrl" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 hover:underline font-medium">View Original Source</a>
              }
              <button class="text-slate-400 mt-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform transition-transform" [class.rotate-180]="isOriginalTextExpanded" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
            </div>
            @if (isOriginalTextExpanded) {
              <div class="px-6 pb-6 border-t border-slate-100">
                <textarea readonly class="w-full h-64 mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg resize-none text-sm font-mono text-slate-600">{{ rec.originalText }}</textarea>
              </div>
            }
          </div>

        </main>
      </div>
    }
  `,
  styles: [`
    .animate-progress { stroke-dasharray: 0, 100; animation: progress 1.5s ease-out forwards; }
    @keyframes progress { from { stroke-dasharray: 0, 100; } }
  `]
})
export class AnalysisComponent {
  record = input.required<AnalysisRecord>();
  goBack = output<void>();

  expandedIndices: Set<number> = new Set();
  isOriginalTextExpanded = false;

  toggleClause(index: number) { this.expandedIndices.has(index) ? this.expandedIndices.delete(index) : this.expandedIndices.add(index); }
  isExpanded(index: number): boolean { return this.expandedIndices.has(index); }
  toggleOriginalText() { this.isOriginalTextExpanded = !this.isOriginalTextExpanded; }

  getScoreColor(score: number): string {
    if (score < 30) return 'text-emerald-500'; if (score < 70) return 'text-amber-500'; return 'text-red-500';
  }
  getScoreTextColor(score: number): string {
    if (score < 30) return 'text-emerald-700'; if (score < 70) return 'text-amber-700'; return 'text-red-700';
  }
  getScoreLabel(score: number): string {
    if (score < 30) return 'Generally Safe'; if (score < 70) return 'Exercise Caution'; return 'High Risk';
  }
  getBadgeClass(level: string): string {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
