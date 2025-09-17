// src/app/core/services/lock-manager.service.ts
import { Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LockManagerService {
  private readonly defaultTimeout = 3000; // 3 secondes

  constructor(private ngZone: NgZone) {}

  private async waitForLock(lockName: string, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const tryAcquire = async () => {
        try {
          const acquired = await navigator.locks.request(
            lockName,
            { mode: 'exclusive', ifAvailable: true },
            (lock) => !!lock
          );
          
          if (acquired || Date.now() - startTime >= timeoutMs) {
            resolve(acquired);
          } else {
            setTimeout(tryAcquire, 100); // Réessayer après 100ms
          }
        } catch (error) {
          console.error('Lock error', error);
          resolve(false);
        }
      };
      
      tryAcquire();
    });
  }

  async acquireExclusiveLock(lockName: string, timeoutMs?: number): Promise<boolean> {
    return this.ngZone.runOutsideAngular(async () => {
      if (!('locks' in navigator)) {
        console.warn('LockManager API not available');
        return true; // Fallback: continue sans verrouillage
      }

      return this.waitForLock(lockName, timeoutMs ?? this.defaultTimeout);
    });
  }

  async withLock<T>(lockName: string, callback: () => Promise<T>, timeoutMs?: number): Promise<T> {
    const acquired = await this.acquireExclusiveLock(lockName, timeoutMs);
    if (!acquired) throw new Error(`Could not acquire lock: ${lockName} within timeout`);

    try {
      return await callback();
    } finally {
      // Le verrou est automatiquement libéré quand la promesse se résout
    }
  }
}