import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { ChatComponent } from '@shared/chat-bot/components/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'AframGroup';
  constructor(
    private titleService: Title,
  ) {}

  private router = inject(Router);
  private activatedRoute= inject(ActivatedRoute);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute.firstChild;
        while (route?.firstChild) {
          route = route.firstChild;
        }
        return route?.snapshot.data['title'];
      })
    ).subscribe((pageTitle: string | undefined) => {
      if (pageTitle) {
        this.titleService.setTitle(pageTitle);
      }
    });
  }
}
