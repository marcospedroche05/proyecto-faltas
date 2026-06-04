import { Injectable, signal } from '@angular/core';

import { AppNotification, NotificationType } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>([]);

  readonly notifications = this._notifications.asReadonly();

  success(message: string): void {
    this.add('success', message);
  }

  error(message: string): void {
    this.add('error', message);
  }

  info(message: string): void {
    this.add('info', message);
  }

  dismiss(id: string): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  private add(type: NotificationType, message: string): void {
    const id = crypto.randomUUID();
    this._notifications.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
