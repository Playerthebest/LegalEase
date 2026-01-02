
import { Injectable } from '@angular/core';
import { AnalysisRecord } from '../types';
import { 
  WIKIPEDIA_PRIVACY_POLICY,
  GOOGLE_PRIVACY_POLICY,
  TIKTOK_PRIVACY_POLICY,
  REDDIT_PRIVACY_POLICY
} from '../example-data';

@Injectable({
  providedIn: 'root'
})
export class ExampleDataService {
  getExamples(): AnalysisRecord[] {
    return [
      {
        id: 1,
        title: 'Wikipedia Privacy Policy',
        originalText: WIKIPEDIA_PRIVACY_POLICY,
        jurisdiction: 'United States',
        createdAt: new Date().toISOString(),
        isExample: true,
        sourceUrl: 'https://foundation.wikimedia.org/wiki/Policy:Privacy_policy',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg',
        logoInvertClass: true
      },
      {
        id: 2,
        title: 'Google Privacy Policy',
        originalText: GOOGLE_PRIVACY_POLICY,
        jurisdiction: 'United States',
        createdAt: new Date().toISOString(),
        isExample: true,
        sourceUrl: 'https://policies.google.com/privacy',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
        logoInvertClass: false
      },
      {
        id: 3,
        title: 'TikTok Privacy Policy',
        originalText: TIKTOK_PRIVACY_POLICY,
        jurisdiction: 'United States',
        createdAt: new Date().toISOString(),
        isExample: true,
        sourceUrl: 'https://www.tiktok.com/legal/page/us/privacy-policy/en',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
        logoInvertClass: true
      },
      {
        id: 4,
        title: 'Reddit Privacy Policy',
        originalText: REDDIT_PRIVACY_POLICY,
        jurisdiction: 'United States',
        createdAt: new Date().toISOString(),
        isExample: true,
        sourceUrl: 'https://www.reddit.com/policies/privacy-policy',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bd/Reddit_Logo_Icon.svg',
        logoInvertClass: false
      }
    ];
  }
}
