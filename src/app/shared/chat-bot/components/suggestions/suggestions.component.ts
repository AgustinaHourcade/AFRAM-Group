import { FaqItem } from '@shared/chat-bot/interface/chat.interface';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css']
})
export class SuggestionsComponent {
  @Input() faqs: FaqItem[] = [];
  @Output() suggestionSelected = new EventEmitter<string>();

  selectSuggestion(question: string): void {
    this.suggestionSelected.emit(question);
  }
}
