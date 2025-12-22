import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Home, Search, ArrowLeft } from 'lucide-angular';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [LucideAngularModule],
    template: `
    <div class="min-h-screen w-full bg-gradient-to-br from-[#F5F7FA] to-[#E8EAF6] flex items-center justify-center px-6">
      <div class="max-w-2xl w-full text-center">
        <!-- 404 Number -->
        <div class="mb-8">
          <h1 class="text-[180px] font-bold bg-gradient-to-r from-[#3949AB] to-[#5C6BC0] bg-clip-text text-transparent leading-none">
            404
          </h1>
        </div>

        <!-- Message -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-[#1A237E] mb-4">Page Not Found</h2>
          <p class="text-gray-600 text-lg mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p class="text-gray-500">
            It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        <!-- Illustration -->
        <div class="mb-12 flex justify-center">
          <div class="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-lg">
            <lucide-icon [img]="SearchIcon" class="w-32 h-32 text-[#3949AB] opacity-20"></lucide-icon>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            (click)="goBack()"
            class="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#3949AB] rounded-xl font-semibold hover:bg-[#E8EAF6] transition-all shadow-md">
            <lucide-icon [img]="ArrowLeftIcon" class="w-5 h-5"></lucide-icon>
            Go Back
          </button>
          
          <button 
            (click)="goHome()"
            class="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#3949AB] to-[#5C6BC0] text-white rounded-xl font-semibold hover:from-[#1A237E] hover:to-[#3949AB] transition-all shadow-lg">
            <lucide-icon [img]="HomeIcon" class="w-5 h-5"></lucide-icon>
            Go to Home
          </button>
        </div>

        <!-- Help Text -->
        <div class="mt-12 text-sm text-gray-500">
          <p>Need help? <a href="/support" class="text-[#3949AB] hover:underline font-semibold">Contact Support</a></p>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class NotFoundComponent {
    readonly HomeIcon = Home;
    readonly SearchIcon = Search;
    readonly ArrowLeftIcon = ArrowLeft;

    constructor(private router: Router) { }

    goBack(): void {
        window.history.back();
    }

    goHome(): void {
        this.router.navigate(['/home']);
    }
}
