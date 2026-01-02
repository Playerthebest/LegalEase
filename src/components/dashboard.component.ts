
import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HomeComponent } from './home.component';
import { ExampleDataService } from '../services/example-data.service';
import { GeminiService } from '../services/gemini.service';
import { AnalysisRecord, AnalysisResult } from '../types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HomeComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div class="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      
      <!-- Header -->
      <header class="sticky top-0 z-20 backdrop-blur-md bg-slate-900/50 border-b border-slate-700">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 class="text-2xl font-serif font-bold tracking-tight">Legal<span class="text-blue-400">Ease</span></h1>
          <div class="flex items-center gap-4">
            <button (click)="clearHistory()" class="text-sm font-medium text-slate-400 hover:text-white transition">Clear History</button>
          </div>
        </div>
      </header>

      <main class="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <!-- New Analysis Component -->
        <app-home (analysisComplete)="viewAnalysis.emit($event)" />

        <!-- Example Analyses -->
        <div class="mt-12">
           <h3 class="text-2xl font-serif font-bold text-center text-slate-100 mb-6">Example Analyses</h3>
           <div class="flex justify-center gap-6 flex-wrap">
              @for (example of examples; track example.id) {
                <div class="bg-white/5 p-5 rounded-xl border border-white/10 w-64 text-center hover:bg-white/10 transition cursor-pointer shadow-lg flex flex-col justify-between"
                     (click)="analyzeExample(example)">
                  <div>
                    <div class="h-12 w-12 flex items-center justify-center mb-3 mx-auto">
                      <img [src]="example.logoUrl" class="max-h-full max-w-full" [class.invert]="example.logoInvertClass" [class.brightness-0]="example.logoInvertClass">
                    </div>
                    <h4 class="font-bold text-white">{{ example.title }}</h4>
                  </div>

                  <div class="mt-4 h-8 flex items-center justify-center">
                    @if (analyzingExampleId() === example.id) {
                      <div class="flex items-center gap-2 text-slate-300">
                          <div class="loader-white"></div>
                          <span class="text-sm">Analyzing...</span>
                      </div>
                    } @else {
                      <div class="bg-blue-500/50 text-white text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wider group-hover:bg-blue-500/80 transition">
                          Analyze Now
                      </div>
                    }
                  </div>
                </div>
              }
           </div>
        </div>

        <!-- Analysis History -->
        <div class="mt-12">
          <h2 class="text-3xl font-serif font-bold mb-6 text-center">Analysis History</h2>
          @if (analyses() && analyses().length > 0) {
            <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg p-6">
              <ul class="divide-y divide-slate-700">
                @for (record of analyses(); track record.id) {
                  <li class="py-4 flex items-center justify-between gap-4 hover:bg-white/10 -mx-6 px-6 cursor-pointer" (click)="viewAnalysis.emit(record)">
                    <div>
                      <p class="font-bold text-white">{{ record.title }}</p>
                      <p class="text-xs text-slate-400">{{ record.jurisdiction }} - {{ record.createdAt | date:'short' }}</p>
                    </div>
                    @if(record.analysisResult) {
                      <div class="text-right">
                         <span [class]="getBadgeClass(record.analysisResult.overallRiskScore)"
                               class="text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide">
                           {{ record.analysisResult.overallRiskScore }} - {{ getScoreLabel(record.analysisResult.overallRiskScore) }}
                         </span>
                      </div>
                    }
                  </li>
                }
              </ul>
            </div>
          } @else {
            <div class="text-center py-12 bg-white/5 backdrop-blur-sm border border-dashed border-white/10 rounded-2xl">
              <p class="text-slate-400">Your analyzed documents will appear here.</p>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .animate-blob { animation: blob 7s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .loader-white {
       border: 2px solid rgba(255,255,255,0.3);
       border-radius: 50%;
       border-top: 2px solid white;
       width: 20px;
       height: 20px;
       animation: spin 1s linear infinite;
    }
    @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent {
  authService = inject(AuthService);
  exampleDataService = inject(ExampleDataService);
  geminiService = inject(GeminiService);

  viewAnalysis = output<AnalysisRecord>();

  analyses = this.authService.analyses;
  examples = this.exampleDataService.getExamples();
  analyzingExampleId = signal<number | null>(null);

  clearHistory() {
    if (confirm('Are you sure you want to clear all analysis and chat history? This action cannot be undone.')) {
      this.authService.clearAllData();
    }
  }
  
  async analyzeExample(example: AnalysisRecord) {
    if (this.analyzingExampleId()) return;

    this.analyzingExampleId.set(example.id);
    try {
      const result: AnalysisResult = await this.geminiService.analyzeDocument(
        example.originalText,
        example.jurisdiction
      );
      const analyzedRecord: AnalysisRecord = { ...example, analysisResult: result };
      this.viewAnalysis.emit(analyzedRecord);
    } catch (error) {
      console.error("Failed to analyze example:", error);
      // Optionally, set an error state to show in the UI
    } finally {
      this.analyzingExampleId.set(null);
    }
  }

  getBadgeClass(score: number): string {
    if (score < 30) return 'bg-emerald-500/20 text-emerald-300';
    if (score < 70) return 'bg-amber-500/20 text-amber-300';
    return 'bg-red-500/20 text-red-300';
  }

  getScoreLabel(score: number): string {
    if (score < 30) return 'Low Risk';
    if (score < 70) return 'Medium Risk';
    return 'High Risk';
  }
}
