export interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
  isFaqList?: boolean;
  isTopicList?: boolean;
  faqs?: FaqItem[];
  topics?: TopicItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TopicItem {
  title: string;
  icon: string;
  keywords: string[];
  faqs: FaqItem[];
}