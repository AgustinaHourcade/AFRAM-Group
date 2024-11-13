import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {
  urlMapa: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.urlMapa = this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://www.google.com/maps/d/u/0/embed?mid=1DTzuz9383_XxOu9PfqgQWnk6b_sq0Wk&ehbc=2E312F&noprof=1"
    );
  }
}