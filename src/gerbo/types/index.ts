import { Timestamp } from 'firebase/firestore';
// src/types/index.ts
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  fullName?: string;
  mobileNumber?: string;
  businessName?: string;
  website?: string;
  businessSize?: string;
}

export interface CallLog {
  id: string;
  userId: string;
  callSid?: string;
  vapiCallId?: string;
  phoneNumber: string;
  toNumber?: string;
  direction: 'inbound' | 'outbound';
  status: 'in-progress' | 'completed' | 'missed' | 'failed';
  duration: number;
  timestamp: Timestamp | Date;
  startedAt?: Timestamp | Date;
  endedAt?: Timestamp | Date;
  transcript?: string;
  summary?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  recording?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  voiceId: string;
  greeting: string;
  instructions: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Analytics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: number;
  topCallers: Array<{ phoneNumber: string; count: number }>;
}

export interface TopCaller {
  phoneNumber: string;
  count: number;
}

export interface AgentSettings {
  agentName: string;
  greetingMessage: string;
  systemInstructions: string;
  voiceId: string;
  language: string;
  phoneNumber?: string;
  twilioPhoneNumber?: string;
  twilioPhoneSid?: string;
  vapiAssistantId?: string;
  updatedAt?: string;
}
export interface VapiAssistantConfig {
  name: string;
  firstMessage: string;
  model: {
    provider: string;
    model: string;
    systemPrompt: string;
    temperature: number;
  };
  voice: {
    provider: string;
    voiceId: string;
  };
  transcriber: {
    provider: string;
    model: string;
    language: string;
  };
  serverUrl?: string;
  serverUrlSecret?: string;
}

export interface TwilioPhoneNumber {
  phoneNumber: string;
  sid: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

export interface CallFilters {
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  callType: 'all' | 'inbound' | 'outbound';
  answerStatus: 'all' | 'answered' | 'unanswered';
  callerNumber: string;
  receiverNumber: string;
}
