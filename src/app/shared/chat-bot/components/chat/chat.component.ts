import { FaqService } from '@shared/chat-bot/services/faq.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatMessageComponent } from '@shared/chat-bot/components/chat-message/chat-message.component';
import { Message, FaqItem, TopicItem } from '@shared/chat-bot/interface/chat.interface';
import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  @ViewChild('chatMessages') private messagesContainer!: ElementRef;

  isOpen: boolean = false;
  topics: TopicItem[];
  messages: Message[] = [];
  currentMessage: string = '';
  currentTopicFaqs: FaqItem[] = [];

  constructor(private faqService: FaqService) {
    this.topics = this.faqService.getTopics();
    this.addBotMessage('¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?');
    this.showTopics();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const chatWidget = document.querySelector('.chat-widget');
    if (chatWidget && !chatWidget.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  toggleChat(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  preventClose(event: Event): void {
    event.stopPropagation();
  }

  sendMessage(): void {
    if (!this.currentMessage.trim()) return;

    const userMessage = this.currentMessage.trim();
    this.addUserMessage(userMessage);
    this.currentMessage = '';

    const answer = this.faqService.findAnswer(userMessage);
    setTimeout(() => {
      this.addBotMessage(answer);

      const matchingTopic = this.faqService.findTopicByKeyword(userMessage);
      if (matchingTopic) {
        setTimeout(() => {
          this.messages.push({
            content: 'faq-list',
            isBot: true,
            timestamp: new Date(),
            isFaqList: true,
            faqs: matchingTopic.faqs
          });
          this.scrollToBottom();
        }, 500);
      } else {
        this.showTopics();
      }
    }, 500);
  }

  selectTopic(topicTitle: string): void {
    const faqs = this.faqService.getFaqsByTopic(topicTitle);
    this.currentTopicFaqs = faqs;

    this.addUserMessage(`Me gustaría saber sobre ${topicTitle}`);

    setTimeout(() => {
      this.messages.push({
        content: 'faq-list',
        isBot: true,
        timestamp: new Date(),
        isFaqList: true,
        faqs: faqs
      });
      this.scrollToBottom();
    }, 500);
  }

  selectFaq(question: string): void {
    this.addUserMessage(question);
    const answer = this.faqService.findAnswer(question);

    setTimeout(() => {
      this.addBotMessage(answer);
      this.showTopics();
    }, 500);
  }

  private showTopics(): void {
    setTimeout(() => {
      this.messages.push({
        content: 'topic-list',
        isBot: true,
        timestamp: new Date(),
        isTopicList: true,
        topics: this.topics
      });
      this.scrollToBottom();
    }, 1000);
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      content,
      isBot: false,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private addBotMessage(content: string): void {
    this.messages.push({
      content,
      isBot: true,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch(err) { }
  }
}
