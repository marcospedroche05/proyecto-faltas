import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  private readonly confirmDialogService = inject(ConfirmDialogService);

  readonly isOpen = this.confirmDialogService.isOpen;
  readonly message = this.confirmDialogService.message;

  confirm(): void {
    this.confirmDialogService.confirm();
  }

  close(): void {
    this.confirmDialogService.close();
  }
}
