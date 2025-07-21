// src/services/claudeService.ts

import { AudioGenerationParams } from './types';

export class ClaudeService {
  /**
   * Parse a user's music prompt and return structured audio generation parameters
   */
  static async parsePrompt(prompt: string): Promise<AudioGenerationParams> {
    // For now, this is a mock implementation
    // In production, this would call the Claude API
    
    // Extract BPM if mentioned
    const bpmMatch = prompt.match(/(\d+)\s*bpm/i);
    const bpm = bpmMatch ? parseInt(bpmMatch[1]) : null;
    
    // Extract length if mentioned
    const lengthMatch = prompt.match(/(\d+)\s*bar/i);
    const length = lengthMatch ? `${lengthMatch[1]} bars` : '4 bars';
    
    // Detect format
    let format: 'loop' | 'sample' | 'one-shot' = 'sample';
    if (prompt.toLowerCase().includes('loop')) format = 'loop';
    if (prompt.toLowerCase().includes('one-shot') || prompt.toLowerCase().includes('oneshot')) format = 'one-shot';
    
    // Detect energy level
    let energy: 'low' | 'medium' | 'high' = 'medium';
    if (prompt.match(/chill|soft|quiet|ambient|relaxed/i)) energy = 'low';
    if (prompt.match(/aggressive|hard|intense|heavy|energetic/i)) energy = 'high';
    
    // Extract tags from common keywords
    const tags: string[] = [];
    const tagPatterns = [
      /lo-?fi/i, /techno/i, /house/i, /drum/i, /bass/i, /synth/i,
      /ambient/i, /dark/i, /bright/i, /vintage/i, /modern/i, /analog/i,
      /digital/i, /vinyl/i, /distorted/i, /clean/i, /wet/i, /dry/i
    ];
    
    tagPatterns.forEach(pattern => {
      const match = prompt.match(pattern);
      if (match) tags.push(match[0].toLowerCase().replace('-', ''));
    });
    
    // Extract instruments
    const instruments: string[] = [];
    const instrumentPatterns = [
      /drum/i, /bass/i, /synth/i, /pad/i, /lead/i, /piano/i,
      /guitar/i, /strings/i, /brass/i, /kick/i, /snare/i, /hi-?hat/i
    ];
    
    instrumentPatterns.forEach(pattern => {
      const match = prompt.match(pattern);
      if (match) instruments.push(match[0].toLowerCase());
    });
    
    // Detect genre
    let genre: string | null = null;
    const genrePatterns = {
      'techno': /techno/i,
      'house': /house/i,
      'lo-fi hip-hop': /lo-?fi|lofi/i,
      'ambient': /ambient/i,
      'trap': /trap/i,
      'dubstep': /dubstep/i,
      'drum and bass': /dnb|drum\s*and\s*bass/i,
      'hip-hop': /hip-?hop/i,
      'electronic': /electronic/i
    };
    
    for (const [genreName, pattern] of Object.entries(genrePatterns)) {
      if (prompt.match(pattern)) {
        genre = genreName;
        break;
      }
    }
    
    // Extract mood
    const moodWords = prompt.match(/chill|dark|bright|happy|sad|aggressive|mellow|uplifting|mysterious|ethereal/i);
    const mood = moodWords ? moodWords[0].toLowerCase() : 'neutral';
    
    // Generate instructions
    const audio_generation_instructions = this.generateInstructions(prompt, {
      bpm, length, format, energy, genre, mood, instruments
    });
    
    return {
      tags,
      bpm,
      key: null, // Key detection would require more sophisticated analysis
      length,
      genre,
      mood,
      instruments,
      energy,
      format,
      audio_generation_instructions
    };
  }
  
  private static generateInstructions(
    prompt: string,
    params: Partial<AudioGenerationParams>
  ): string {
    const parts: string[] = [];
    
    // Format
    parts.push(`Generate a ${params.format || 'sample'}`);
    
    // Genre/style
    if (params.genre) {
      parts.push(`in ${params.genre} style`);
    }
    
    // Tempo
    if (params.bpm) {
      parts.push(`at ${params.bpm} BPM`);
    }
    
    // Length
    parts.push(`${params.length || '4 bars'} long`);
    
    // Mood and energy
    parts.push(`with ${params.energy || 'medium'} energy and ${params.mood} mood`);
    
    // Instruments
    if (params.instruments && params.instruments.length > 0) {
      parts.push(`featuring ${params.instruments.join(', ')}`);
    }
    
    // Additional characteristics from original prompt
    const characteristics: string[] = [];
    if (prompt.match(/distort/i)) characteristics.push('distortion');
    if (prompt.match(/reverb/i)) characteristics.push('reverb');
    if (prompt.match(/delay/i)) characteristics.push('delay');
    if (prompt.match(/compress/i)) characteristics.push('compression');
    if (prompt.match(/vinyl/i)) characteristics.push('vinyl texture');
    if (prompt.match(/warm/i)) characteristics.push('warm analog character');
    if (prompt.match(/crisp/i)) characteristics.push('crisp high frequencies');
    
    if (characteristics.length > 0) {
      parts.push(`with ${characteristics.join(', ')}`);
    }
    
    return parts.join(', ') + '.';
  }
  
  /**
   * Validate if the parsed parameters are complete enough for generation
   */
  static validateParams(params: AudioGenerationParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (params.tags.length === 0) {
      errors.push('No tags identified from prompt');
    }
    
    if (!params.genre && !params.instruments.length) {
      errors.push('Unable to determine genre or instruments');
    }
    
    if (!params.audio_generation_instructions) {
      errors.push('Failed to generate audio instructions');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Example usage:
/*
const prompt = "Chill lo-fi drum loop, 4 bars, 70 BPM, with vinyl texture";
const result = await ClaudeService.parsePrompt(prompt);
console.log(result);
*/