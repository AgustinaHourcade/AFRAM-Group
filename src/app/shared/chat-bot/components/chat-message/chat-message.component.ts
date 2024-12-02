import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '@shared/chat-bot/interface/chat.interface';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent {
  @Input() message!: Message;
  @Output() faqSelected = new EventEmitter<string>();
  @Output() topicSelected = new EventEmitter<string>();

  selectFaq(question: string): void {
    this.faqSelected.emit(question);
  }

  selectTopic(title: string): void {
    this.topicSelected.emit(title);
  }
}
