import { inject, Injectable, NgZone } from '@angular/core';
import { Observable, Observer, retry, Subject, takeUntil, tap, timer } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { sseEvent } from '../models/sse-event.model';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly streamUrl: string = 'http://localhost:8080/event-stream';
  private readonly reconnnectionDelay: number = 5000
  private stopStream$ = new Subject<void>();
  private sseInitialized = false;
  router = inject(Router);
  constructor(private ngZone: NgZone, private authService: AuthService,
    private route: ActivatedRoute) {
    // Listen for login events to initialize SSE
    this.authService.loginSuccess$.subscribe(() => {
      console.log('Login detected, initializing SSE');
      this.initializeSSE();
    });

    // Check if ALREADY logged in (for page refresh case)
    if (this.authService.isLoggedIn()) {
      console.log('User already logged in, initializing SSE immediately');
      this.initializeSSE();
    }

    // Listen for logout events to stop SSE
    this.authService.logout$.subscribe(() => {
      console.log('Logout detected, stopping SSE');
      this.stopEvents();
    });
  }

  public getEvents(): Observable<sseEvent> {
    return this.createEventObservable().pipe(
      // Parsing the json
      map((rawStringData: String) => {
        const cleanJSON = rawStringData.trim().replace(/^data:/, '').trim();
        return JSON.parse(cleanJSON) as sseEvent;
      }
      ),
      takeUntil(this.stopStream$),
      retry({
        delay: (error) => {
          // For network failures, retrying after a 5s delay
          console.warn('SSE connection failed. Retrying in 5s.', error);
          return timer(this.reconnnectionDelay);
        }
      })
    )
  }

  public initializeSSE(): void {
    if (this.sseInitialized) {
      console.log('SSE already initialized');
      return;
    }
    this.sseInitialized = true;
    console.log('Initializing SSE connection');
    // Start the connection by subscribing to events
    this.createEventObservable().pipe(
      map((rawStringData: String) => {
        const cleanJSON = rawStringData.trim().replace(/^data:/, '').trim();
        return JSON.parse(cleanJSON) as sseEvent;
      }),
      takeUntil(this.stopStream$),
      retry({
        delay: (error) => {
          console.warn('SSE connection failed. Retrying in 5s.', error);
          return timer(this.reconnnectionDelay);
        }
      })
    ).subscribe({
      next: (event) => {
        console.log('SSE Event received in EventService:', event);
        // Events will be handled by components that subscribe to getEvents()
      },
      error: (err) => {
        console.error('SSE Error in EventService:', err);
      }
    });
  }

  private worker: Worker | null = null;

  private createEventObservable(): Observable<string> {
    return new Observable<string>((observer: Observer<string>) => {
      if (typeof Worker !== 'undefined') {
        this.worker = new Worker(new URL('../workers/sse.worker', import.meta.url));

        this.worker.onmessage = ({ data }) => {
          if (data.type === 'EVENT') {
            this.ngZone.run(() => observer.next(data.payload));
          }
          else if (data.type === 'ERROR') {
            if (data.error.status === 401) {
              console.warn('SSE Unauthorized (401). Logging out.');
              this.ngZone.run(() => this.authService.logout());
            }
            else {
              console.error('SSE Worker Error:', data.error);
              this.ngZone.run(() => observer.error(data.error));
            }
          }
        };

        const token = this.authService.getToken();
        this.worker.postMessage({
          type: 'CONNECT',
          payload: {
            url: this.streamUrl,
            token: token
          }
        });
      }
      else {
        // Fallback for environments without Web Worker support (though unlikely in modern browsers)
        console.warn('Web Workers are not supported in this environment. SSE might be throttled in background.');
        observer.error(new Error('Web Workers not supported'));
      }

      return () => {
        console.log('Closing SSE connection');
        this.stopEvents();
      };
    });
  }

  public stopEvents(): void {
    this.stopStream$.next();
    this.sseInitialized = false;
    if (this.worker) {
      this.worker.postMessage({ type: 'STOP' });
      this.worker.terminate();
      this.worker = null;
    }
  }


}
