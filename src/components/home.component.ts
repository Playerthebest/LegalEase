import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountryService } from '../services/country.service';
import { GeminiService } from '../services/gemini.service';
import { AuthService } from '../services/auth.service';
import { AnalysisRecord, AnalysisResult } from '../types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
      <div>
        <div class="text-center mb-10">
          <h2 class="text-3xl md:text-4xl font-serif font-bold text-white mb-2 tracking-tight">Analyze a New Document</h2>
          <p class="text-slate-300 max-w-xl mx-auto font-light">
            Instantly decode complex legal documents into plain English and uncover hidden risks.
          </p>
        </div>

        <!-- Main Card -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-95 text-slate-800">
          <div class="p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div class="p-8">

            <!-- Input Area -->
            <div class="relative mb-6">
              <label class="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Legal Document Text</label>
              <textarea 
                [(ngModel)]="documentText"
                placeholder="Paste your Terms & Conditions, Privacy Policy, or Contract here..."
                class="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm font-mono leading-relaxed transition"
              ></textarea>
              <button (click)="pasteFromClipboard()" class="absolute bottom-4 right-4 bg-white hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 shadow-sm transition flex items-center gap-2" title="Paste from Clipboard">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Paste
              </button>
            </div>

            <!-- More Options Toggle -->
            <div class="mb-6">
              <button (click)="toggleMoreOptions()" class="w-full flex items-center justify-between text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span class="font-bold text-slate-700">More Options</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500 transition-transform transform" [class.rotate-180]="isMoreOptionsOpen()" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <!-- Collapsible Options -->
            @if(isMoreOptionsOpen()) {
              <div class="mb-6 space-y-6 p-4 bg-slate-50/70 rounded-lg border border-slate-200">
                <!-- Jurisdiction -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Jurisdiction</label>
                  <div class="relative">
                    <select 
                      [ngModel]="countryService.selectedCountry()"
                      (ngModelChange)="countryService.selectedCountry.set($event)"
                      class="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white font-medium appearance-none border">
                      @for (country of countryService.countries; track country) {
                        <option [value]="country">{{ country }}</option>
                      }
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <!-- Document Type Dropdown -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Document Type</label>
                  <div class="relative">
                    <select 
                      [ngModel]="selectedDocumentType()"
                      (ngModelChange)="selectedDocumentType.set($event)"
                      class="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white font-medium appearance-none border">
                      @for (type of documentTypes; track type) {
                        <option [value]="type">{{ type }}</option>
                      }
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                
                <!-- Additional Notes -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Additional Notes</label>
                  <textarea 
                    [(ngModel)]="additionalNotes"
                    placeholder="e.g., 'Focus on intellectual property clauses', or 'Is the liability cap reasonable for a startup?'"
                    class="w-full h-24 p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed transition"
                  ></textarea>
                </div>
              </div>
            }

            <!-- Action -->
            <button (click)="analyze()" [disabled]="isAnalyzing() || !documentText().trim()"
                    class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3">
              @if (isAnalyzing()) {
                <div class="loader"></div>
                <span>Analyzing Document...</span>
              } @else {
                <span>Analyze Risks</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              }
            </button>
            
            @if (error()) {
              <div class="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {{ error() }}
              </div>
            }
          </div>
        </div>

        <p class="text-center text-slate-500 text-xs mt-8">
          LegalEase provides automated insights and is not a substitute for professional legal counsel.
        </p>
      </div>
  `,
  styles: [`
    .loader {
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
export class HomeComponent {
  countryService = inject(CountryService);
  geminiService = inject(GeminiService);
  authService = inject(AuthService);

  documentText = signal('');
  selectedDocumentType = signal('Auto-detect');
  additionalNotes = signal('');
  isMoreOptionsOpen = signal(false);
  isAnalyzing = signal(false);
  error = signal<string | null>(null);

  analysisComplete = output<AnalysisRecord>();

  documentTypes = [
    "Auto-detect",
    "Terms of Service",
    "Privacy Policy",
    "Employment Contract",
    "Non-Disclosure Agreement (NDA)",
    "Residential Lease",
    "Commercial Lease",
    "Sales Contract",
    "Service Agreement",
    "Software License Agreement (EULA)",
    "Consulting Agreement",
    "Partnership Agreement",
    "Shareholder Agreement",
    "Memorandum of Understanding (MOU)",
    "Letter of Intent (LOI)",
    "Company Memo",
    "Board Resolution",
    "Meeting Minutes",
    "IPO Prospectus",
    "Annual Report (10-K)",
    "Quarterly Report (10-Q)",
    "Merger Agreement",
    "Acquisition Agreement",
    "Intellectual Property License",
    "Cookie Policy",
    "GDPR Compliance Document",
    "Loan Agreement",
    "Promissory Note",
    "Settlement Agreement",
    "Power of Attorney",
    "Last Will and Testament",
    "Trust Deed",
    "Articles of Incorporation",
    "Bylaws",
    "Cease and Desist Letter",
    "Demand Letter",
    "Freelance Contract",
    "Vendor Agreement",
    "Investment Agreement"
  ];

  toggleMoreOptions() {
    this.isMoreOptionsOpen.update(v => !v);
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.documentText.set(text);
    } catch (err) {
      this.error.set("Could not access clipboard. Please paste manually.");
    }
  }

  async analyze() {
    if (!this.documentText().trim()) return;

    this.isAnalyzing.set(true);
    this.error.set(null);

    try {
      // Auto-generate a title from the first 5 words.
      const generatedTitle = this.documentText().trim().split(/\s+/).slice(0, 5).join(' ') + '...';

      const result: AnalysisResult = await this.geminiService.analyzeDocument(
        this.documentText(),
        this.countryService.selectedCountry(),
        this.selectedDocumentType(),
        this.additionalNotes()
      );
      
      const record: AnalysisRecord = {
        id: Date.now(),
        title: generatedTitle,
        originalText: this.documentText(),
        analysisResult: result,
        jurisdiction: this.countryService.selectedCountry(),
        createdAt: new Date().toISOString()
      };

      this.authService.saveAnalysis(record);
      this.analysisComplete.emit(record);

      // Reset form
      this.documentText.set('');
      this.additionalNotes.set('');

    } catch (e) {
      this.error.set("Analysis failed. Please try again later or check your network.");
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}