import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { LealtixConfig } from '../utils/lealtix-config';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit, OnDestroy {
  currentDate: string = LealtixConfig.PRIVACY_POLICY.LAST_UPDATE;
  contactEmail: string = LealtixConfig.CONTACT_EMAIL;

  constructor(
    private renderer: Renderer2,
    private location: Location
  ) {}

  ngOnInit() {
    this.renderer.addClass(document.body, 'privacy-page');
    window.scrollTo(0, 0);
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'privacy-page');
  }

  goBack(): void {
    this.location.back();
  }
}
