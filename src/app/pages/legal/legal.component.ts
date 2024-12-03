import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '@shared/footer/footer.component';
import { NavbarHomeComponent } from '@shared/navbar-home/navbar-home.component';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [FooterComponent, NavbarHomeComponent ],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.css'
})
export class LegalComponent implements OnInit {

  ngOnInit(): void {
    this.scrollToTop();
  }

  scrollToTop() {
    const firstElement = document.querySelector('.intro');
    if (firstElement) {
      firstElement.scrollIntoView({ behavior: 'instant', block: 'end' });
    }
  }
}
