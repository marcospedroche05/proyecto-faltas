import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _isOpen = signal<boolean>(false);
  private readonly _message = signal<string>('');
  private readonly _onConfirm = signal<(() => void) | null>(null);

  readonly isOpen = this._isOpen.asReadonly();
  readonly message = this._message.asReadonly();

  open(message: string, onConfirm: () => void): void {
    this._message.set(message);
    this._onConfirm.set(onConfirm);
    this._isOpen.set(true);
  }

  confirm(): void {
    const cb = this._onConfirm();
    if (cb !== null) {
      cb();
    }
    this.close();
  }

  close(): void {
    this._isOpen.set(false);
    this._message.set('');
    this._onConfirm.set(null);
  }
}
