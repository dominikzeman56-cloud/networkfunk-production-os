// NPOS Producer Pal Integration - Česká verze
// Načte a analyzuje data z Producer Pal JSON exportu

import fs from 'fs';
import path from 'path';
import { paths } from './config';

interface ProducerPalData {
  session: {
    name: string;
    bpm: number;
    key: string;
    date: string;
  };
  tracks: Track[];
  mix: MixData;
  decisions: Decision[];
}

interface Track {
  name: string;
  type: 'audio' | 'midi';
  groups: string[];
  plugins: string[];
  routing: 'serial' | 'parallel';
  automation: string[];
}

interface MixData {
  frequency_map: Record<string, number>;
  stereo_image: Record<string, boolean>;
  dynamics: {
    crest_factor: number;
    compression_ratio: string;
  };
}

interface Decision {
  what: string;
  why: string;
  result: string;
}

/**
 * Načte Producer Pal JSON soubor
 */
export function loadProducerPalData(filePath: string): ProducerPalData | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading Producer Pal data:', error);
    return null;
  }
}

/**
 * Analyzuje data a generuje závěry pro NPOS
 */
export function analyzeProducerPalData(data: ProducerPalData): AnalysisResult {
  const analysis: AnalysisResult = {
    summary: '',
    recommendations: [],
    issues: [],
    relatedKnowledge: []
  };

  // Analyza bassového profilu
  const bass = data.mix.frequency_map['bass'] || data.mix.frequency_map['mid'];
  if (bass && bass < 40) {
    analysis.issues.push({
      type: 'low-end',
      description: 'Bass frekvence jsou nižší než doporučeno pro neurofunk',
      recommendation: 'Zvýšit bass energii kolem 60-100Hz',
      reference: 'Knowledge/Bass-Engineering'
    });
  }

  // Analyza stereo imagu
  if (data.mix.stereo_image['bass_mono'] === false) {
    analysis.issues.push({
      type: 'stereo',
      description: 'Bass není v mono - může způsobit problémy na slabých reproduktorech',
      recommendation: 'Použít mono maker pod 250Hz',
      reference: 'Knowledge/Stereo'
    });
  }

  // Analyza dynamics
  if (data.mix.dynamics.crest_factor < 4) {
    analysis.recommendations.push({
      type: 'dynamics',
      description: 'Mix je velmi pushed',
      recommendation: 'Zvažte méně komprese pro dynamiku',
      reference: 'Knowledge/Dynamics'
    });
  }

  // Analyza rozhodnutí
  const decisions = data.decisions || [];
  if (decisions.length > 0) {
    analysis.summary = `Pracoval jste na: ${data.session.name} (${data.session.bpm} BPM, ${data.session.key})\n\n` +
      `Rozhodnutí: ${decisions.map(d => `${d.what} - ${d.why}`).join('\n')}`;
  }

  return analysis;
}

/**
 * Výsledek analýzy
 */
interface AnalysisResult {
  summary: string;
  recommendations: Recommendation[];
  issues: Issue[];
  relatedKnowledge: string[];
}

interface Recommendation {
  type: string;
  description: string;
  recommendation: string;
  reference: string;
}

interface Issue {
  type: string;
  description: string;
  recommendation: string;
  reference: string;
}

/**
 * Příklad použití
 */
if (import.meta.url === process.argv[1]) {
  const data = loadProducerPalData(paths.sessionFile);
  if (data) {
    const result = analyzeProducerPalData(data);
    console.log(result);
  }
}
