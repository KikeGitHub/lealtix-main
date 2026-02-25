import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [CommonModule]
})
export class FooterComponent {

  @Input() dir: string = '';
  @Input() tel: string = '';
  @Input() bussinesEmail: string = '';
  @Input() twiter: string = '';
  @Input() facebook: string = '';
  @Input() linkedin: string = '';
  @Input() instagram: string = '';
  @Input() schelules: string = '';
  @Input() tiktok: string = '';

  showIcon(value: string | null | undefined): boolean {
    if (!value) return false;
    const v = value.trim();
    if (v.length === 0) return false;
    const isUrl = /^(https?:\/\/|www\.)/i.test(v);
    return isUrl || v.length > 20;
  }
}
