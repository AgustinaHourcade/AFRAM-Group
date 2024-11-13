import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqItem } from '../../interface/chat.interface';

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