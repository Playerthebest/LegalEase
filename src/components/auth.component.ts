
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      <!-- Abstract Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div class="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div class="w-full max-w-sm z-10">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-5xl font-serif font-bold text-white mb-2 tracking-tight">Legal<span class="text-blue-400">Ease</span></h1>
          <p class="text-slate-300 font-light">Your Personal AI Legal Analyst</p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-95 p-8">
          <h2 class="text-2xl font-bold text-slate-800 text-center mb-1">{{ mode() === 'login' ? 'Welcome Back' : 'Create Account' }}</h2>
          <p class="text-center text-slate-500 text-sm mb-6">{{ mode() === 'login' ? 'Sign in to continue' : 'Get started with your free account' }}</p>

          <form (submit)="handleSubmit()">
            <div class="space-y-4">
              <div>
                <label for="username" class="block text-sm font-medium text-slate-700">Username</label>
                <input id="username" name="username" type="text" [(ngModel)]="username" required
                       class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                <input id="password" name="password" type="password" [(ngModel)]="password" required
                       class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              </div>
            </div>

            @if (error()) {
              <p class="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{{ error() }}</p>
            }

            <button type="submit" [disabled]="isLoading()"
                    class="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center">
              @if (isLoading()) {
                <div class="loader-sm"></div>
              } @else {
                <span>{{ mode() === 'login' ? 'Log In' : 'Sign Up' }}</span>
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-500">
            {{ mode() === 'login' ? "Don't have an account?" : "Already have an account?" }}
            <button (click)="toggleMode()" class="font-medium text-blue-600 hover:text-blue-500">
              {{ mode() === 'login' ? 'Sign up' : 'Log in' }}
            </button>
          </p>
        </div>
      </div>
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
    .loader-sm {
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
export class AuthComponent {
  authService = inject(AuthService);

  mode = signal<AuthMode>('login');
  username = '';
  password = '';
  error = signal<string | null>(null);
  isLoading = signal(false);

  toggleMode() {
    this.mode.update(m => m === 'login' ? 'signup' : 'login');
    this.error.set(null);
    this.username = '';
    this.password = '';
  }

  handleSubmit() {
    this.isLoading.set(true);
    this.error.set(null);
    let result: { success: boolean, message: string };

    if (this.mode() === 'login') {
      result = this.authService.login(this.username, this.password);
    } else {
      result = this.authService.signup(this.username, this.password);
    }
    
    if (!result.success) {
      this.error.set(result.message);
    }
    
    this.isLoading.set(false);
  }
}
