// src/services/types.ts

export interface AudioGenerationParams {
  tags: string[];
  bpm: number | null;
  key: string | null;
  length: string;
  genre: string | null;
  mood: string;
  instruments: string[];
  energy: 'low' | 'medium' | 'high';
  format: 'loop' | 'sample' | 'one-shot';
  audio_generation_instructions: string;
}