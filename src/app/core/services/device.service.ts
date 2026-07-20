/**
 * DeviceService
 * ─────────────────────────────────────────────────────────
 * Generates and persists a stable device ID.
 * Attaches device fingerprint to auth requests.
 * Prepares for future trusted-device / session management.
 */
import { Injectable } from '@angular/core';
import { DeviceInfo } from '@core/models';

const DEVICE_KEY = 'aegislex_device_id';

@Injectable({ providedIn: 'root' })
export class DeviceService {

  private _deviceId: string | null = null;

  get deviceId(): string {
    if (this._deviceId) return this._deviceId;
    const stored = localStorage.getItem(DEVICE_KEY);
    if (stored) { this._deviceId = stored; return stored; }
    const id = this.generateId();
    localStorage.setItem(DEVICE_KEY, id);
    this._deviceId = id;
    return id;
  }

  getDeviceInfo(): DeviceInfo {
    return {
      deviceId:   this.deviceId,
      userAgent:  navigator.userAgent,
      platform:   navigator.platform || 'unknown',
      language:   navigator.language || 'en',
      timezone:   Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      screenSize: `${screen.width}x${screen.height}`,
    };
  }

  private generateId(): string {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }
}
