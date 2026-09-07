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
  @Input() bussinessName: string = '';

  year = new Date().getFullYear();

  showIcon(value: string | null | undefined): boolean {
    if (!value) return false;
    const v = value.trim();
    if (v.length === 0) return false;
    const isUrl = /^(https?:\/\/|www\.)/i.test(v);
    return isUrl || v.length > 20;
  }

  // Convierte el texto de horarios en filas {day, time}
  getScheduleHours(): { day: string; time: string }[] {
    if (!this.schelules) return [];
    return String(this.schelules)
      .split(/\n|;/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((line) => {
        const m = line.match(/^(.+?)\s+(?:de|desde)\s+(.+)$/i);
        if (m) return { day: m[1].trim(), time: m[2].trim() };
        return { day: '', time: line };
      });
  }
}
