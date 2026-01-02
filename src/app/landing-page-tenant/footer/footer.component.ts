import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [CommonModule]
})
export class FooterComponent implements OnInit {

  @Input() dir: string = '';
  @Input() tel: string = '';
  @Input() bussinesEmail: string = '';
  @Input() twiter: string = '#';
  @Input() facebook: string = '#';
  @Input() linkedin: string = '#';
  @Input() instagram: string = '#';
  @Input() schelules: string = '';
  @Input() tiktok: string = '#';

  ngOnInit() {
    console.log('Footer Component - TikTok value:', this.tiktok);
    console.log('Footer Component - TikTok check:', this.tiktok && this.tiktok !== '#');
    console.log('Footer Component - All social values:', {
      twiter: this.twiter,
      tiktok: this.tiktok,
      facebook: this.facebook,
      linkedin: this.linkedin,
      instagram: this.instagram
    });
  }
}
