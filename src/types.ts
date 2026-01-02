
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AnalysisResult {
  overallRiskScore: number;
  summary: string;
  clauses: {
    title:string;
    originalText: string;
    laymanExplanation: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    riskReason: string;
  }[];
}

export interface AnalysisRecord {
  id: number; // timestamp
  title: string;
  originalText: string;
  analysisResult?: AnalysisResult;
  jurisdiction: string;
  createdAt: string; // ISO string
  isExample?: boolean;
  sourceUrl?: string;
  logoUrl?: string;
  logoInvertClass?: boolean;
}
