// Grammar checking service using basic rules and patterns

// Common grammar mistakes and their corrections
const commonErrors = [
  { pattern: /\s\s+/g, correction: ' ', message: 'Remove multiple spaces' },
  { pattern: /\b(a)\s+([aeiou])/gi, correction: 'an $2', message: 'Use "an" before vowels' },
  { pattern: /\b(i)\b/g, correction: 'I', message: 'Capitalize the pronoun "I"' },
  { pattern: /\b(its)\s+(\w+ing)\b/gi, correction: "it's $2", message: 'Use "it\'s" as contraction of "it is"' },
  { pattern: /\b(effect)\b/gi, suggestion: 'effect/affect', message: 'Verify correct usage of "effect" vs "affect"' },
  { pattern: /\b(their|they're|there)\b/gi, suggestion: 'their/they\'re/there', message: 'Verify correct usage of "their/they\'re/there"' },
  { pattern: /\b(your|you're)\b/gi, suggestion: 'your/you\'re', message: 'Verify correct usage of "your/you\'re"' },
  { pattern: /\b(then|than)\b/gi, suggestion: 'then/than', message: 'Verify correct usage of "then/than"' },
  { pattern: /\b(\w+)\s\1\b/gi, suggestion: 'repeated word', message: 'Possible repeated word' },
  { pattern: /\b(data)\s+(is)\b/gi, suggestion: 'data are', message: 'Data is plural and should use "are"' },
  { pattern: /\b(this|that)\s+(?!is|was|has|have|will|would|could|should)/gi, suggestion: 'missing noun', message: 'Consider adding a noun after "this" or "that"' },
];

// Academic-specific checks
const academicErrors = [
  { pattern: /\b(very|really|extremely)\b/gi, suggestion: 'more precise term', message: 'Consider using a more precise term instead of intensifiers' },
  { pattern: /\b(many|several|some)\s+(researchers|studies|experiments)\b/gi, suggestion: 'specific number', message: 'Consider using a specific number instead of vague quantifiers' },
  { pattern: /\b(proves|prove|proven)\b/gi, suggestion: 'suggests/indicates/demonstrates', message: 'Scientific research "suggests" or "indicates" rather than "proves"' },
  { pattern: /\b(always|never|all|none)\b/gi, suggestion: 'more nuanced term', message: 'Avoid absolutes in academic writing' },
  { pattern: /\b(obvious|obviously|clearly)\b/gi, suggestion: 'omit or rephrase', message: 'What seems "obvious" may not be to all readers' },
  { pattern: /\b(I think|I believe|in my opinion)\b/gi, suggestion: 'omit or rephrase', message: 'Avoid personal opinions in formal academic writing' },
];

// Passive voice detection (simplified)
const passiveVoicePattern = /\b(is|are|was|were|be|been|being)\s+(\w+ed)\b/gi;

export interface GrammarError {
  index: number;
  length: number;
  message: string;
  correction?: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'suggestion';
}

export interface GrammarCheckResult {
  errors: GrammarError[];
  passiveCount: number;
  totalWords: number;
  score: number; // 0-100
  suggestions: string[];
}

// Main function to check text for grammar errors
export function checkGrammar(text: string): GrammarCheckResult {
  let errors: GrammarError[] = [];
  
  // Count words and sentences
  const words = text.match(/\b\w+\b/g) || [];
  const totalWords = words.length;
  
  // Check for common grammar errors
  commonErrors.forEach(error => {
    let match;
    while ((match = error.pattern.exec(text)) !== null) {
      errors.push({
        index: match.index,
        length: match[0].length,
        message: error.message,
        correction: error.correction,
        suggestion: error.suggestion,
        severity: 'error'
      });
    }
  });
  
  // Check for academic-specific errors
  academicErrors.forEach(error => {
    let match;
    while ((match = error.pattern.exec(text)) !== null) {
      errors.push({
        index: match.index,
        length: match[0].length,
        message: error.message,
        suggestion: error.suggestion,
        severity: 'warning'
      });
    }
  });
  
  // Count passive voice instances
  let passiveCount = 0;
  let match;
  while ((match = passiveVoicePattern.exec(text)) !== null) {
    passiveCount++;
    errors.push({
      index: match.index,
      length: match[0].length,
      message: 'Consider using active voice',
      severity: 'suggestion'
    });
  }
  
  // Calculate overall score based on error frequency
  const errorRatio = errors.length / Math.max(totalWords / 100, 1); // Errors per 100 words
  const score = Math.max(0, Math.min(100, 100 - errorRatio * 5));
  
  // Generate overall suggestions
  const suggestions: string[] = [];
  
  if (passiveCount > totalWords * 0.1) {
    suggestions.push('Consider reducing passive voice usage');
  }
  
  if (errors.filter(e => e.severity === 'error').length > 5) {
    suggestions.push('Consider having your paper reviewed for grammatical errors');
  }
  
  // Academic-specific suggestions
  if (totalWords < 2000) {
    suggestions.push('Consider expanding your research paper - typical papers are 3000+ words');
  }
  
  return {
    errors,
    passiveCount,
    totalWords,
    score,
    suggestions
  };
}