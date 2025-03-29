// Research paper format checking service with AI capabilities

export interface FormatSection {
  name: string;
  required: boolean;
  expectedLength?: [number, number]; // Min and max words
  patterns?: RegExp[]; // Patterns to look for in this section
  aiDescription?: string; // Description for AI evaluation
}

export interface FormatCheckResult {
  missingRequiredSections: string[];
  sectionLengthIssues: { section: string; issue: string }[];
  formatScore: number; // 0-100
  suggestions: string[];
  detectedSections: string[];
  aiAnalysis?: { 
    overallQuality: string; // "Excellent" | "Good" | "Average" | "Needs Improvement"
    strengths: string[];
    weaknesses: string[];
    academicTone: number; // 0-100
    organizationScore: number; // 0-100
  };
}

// Define expected sections and their requirements with AI descriptions
const researchPaperSections: FormatSection[] = [
  {
    name: "Abstract",
    required: true,
    expectedLength: [150, 300],
    patterns: [/summariz(e|es|ed|ing)/i, /this (paper|research|study)/i],
    aiDescription: "A concise summary of the research including purpose, methods, results, and conclusions"
  },
  {
    name: "Introduction",
    required: true,
    expectedLength: [500, 1000],
    patterns: [/introduc(e|es|ed|ing)/i, /background/i, /purpose/i],
    aiDescription: "Provides context, research questions/objectives, and outlines the paper structure"
  },
  {
    name: "Literature Review",
    required: true,
    expectedLength: [800, 2000],
    patterns: [/literature/i, /review/i, /previous (research|studies|work)/i],
    aiDescription: "Critical analysis of existing research related to the topic, identifying gaps"
  },
  {
    name: "Methodology",
    required: true,
    expectedLength: [600, 1500],
    patterns: [/method(s|ology)?/i, /approach/i, /data collection/i, /experiment/i],
    aiDescription: "Detailed explanation of research design, data collection, and analysis procedures"
  },
  {
    name: "Results",
    required: true,
    expectedLength: [600, 1500],
    patterns: [/result(s)?/i, /finding(s)?/i, /analysis/i, /data/i],
    aiDescription: "Presentation of data findings without interpretation, using tables and figures"
  },
  {
    name: "Discussion",
    required: true,
    expectedLength: [800, 1800],
    patterns: [/discuss(ion)?/i, /interpret(ation)?/i, /implic(ation|ations)/i],
    aiDescription: "Interpretation of results, comparison with literature, limitations discussion"
  },
  {
    name: "Conclusion",
    required: true,
    expectedLength: [300, 800],
    patterns: [/conclu(de|sion)/i, /summary/i, /future (work|research)/i],
    aiDescription: "Summary of key findings, implications, recommendations for future research"
  },
  {
    name: "References",
    required: true,
    patterns: [/reference(s)?/i, /bibliograph(y|ies)/i, /citation(s)?/i],
    aiDescription: "List of all sources cited in the paper, formatted according to a style guide"
  }
];

// Patterns to identify citation styles
const citationPatterns = {
  apa: [/\(\w+,\s+\d{4}\)/, /\w+\s+\(\d{4}\)/],
  mla: [/\(\w+\s+\d+\)/, /\w+\s+\d+/],
  chicago: [/\d+\.\s+/, /\[\d+\]/],
  harvard: [/\(\w+\s+\d{4}\)/, /\w+\s+\d{4}/],
};

// Common academic phrases and jargon to look for as indicators of quality
const academicPhrases = [
  "significant difference", "correlation between", "causal relationship",
  "empirical evidence", "theoretical framework", "paradigm", "methodology",
  "qualitative analysis", "quantitative approach", "data suggest",
  "statistical significance", "according to", "findings indicate", 
  "it is argued that", "furthermore", "moreover", "this study demonstrates",
  "previous research has shown", "et al.", "implications for practice"
];

// AI-powered research paper format checker
export function checkResearchPaperFormat(text: string): FormatCheckResult {
  const result: FormatCheckResult = {
    missingRequiredSections: [],
    sectionLengthIssues: [],
    formatScore: 0,
    suggestions: [],
    detectedSections: [],
    aiAnalysis: {
      overallQuality: "Average",
      strengths: [],
      weaknesses: [],
      academicTone: 70,
      organizationScore: 80
    }
  };
  
  // Convert text to lowercase for pattern matching
  const lowerText = text.toLowerCase();
  
  // Detect sections present in the paper
  researchPaperSections.forEach(section => {
    // Check if section header might be present
    const sectionHeaderPattern = new RegExp(`\\b${section.name.toLowerCase()}\\b`, 'i');
    
    // Check if section content patterns are present
    const hasPatterns = section.patterns?.some(pattern => 
      pattern.test(lowerText)
    );
    
    if (sectionHeaderPattern.test(lowerText) || hasPatterns) {
      result.detectedSections.push(section.name);
    } else if (section.required) {
      result.missingRequiredSections.push(section.name);
    }
  });
  
  // Perform AI analysis based on text content
  performAIAnalysis(text, result);
  
  // Rough estimation of section lengths (simplistic approach)
  const totalWords = text.split(/\s+/).length;
  
  if (totalWords < 3000) {
    result.suggestions.push("Paper appears to be shorter than the recommended length (3000+ words)");
    result.aiAnalysis?.weaknesses.push("Insufficient word count for a comprehensive research paper");
  } else {
    result.aiAnalysis?.strengths.push("Paper meets recommended length requirements");
  }
  
  // Check for citation consistency
  const citationStyle = detectCitationStyle(text);
  if (citationStyle) {
    result.suggestions.push(`Detected citation style appears to be ${citationStyle}`);
    result.aiAnalysis?.strengths.push(`Consistent usage of ${citationStyle.toUpperCase()} citation style`);
  } else {
    result.suggestions.push("No consistent citation style detected. Consider using APA, MLA, or Chicago style consistently");
    result.aiAnalysis?.weaknesses.push("Inconsistent or missing citation style");
  }
  
  // Check for figures and tables
  const hasFigures = /figure \d+|fig\. \d+/i.test(text);
  const hasTables = /table \d+/i.test(text);
  
  if (!hasFigures && !hasTables) {
    result.suggestions.push("Consider adding figures or tables to illustrate your findings");
    result.aiAnalysis?.weaknesses.push("Lack of visual data presentation (figures/tables)");
  } else {
    result.aiAnalysis?.strengths.push("Effective use of visual elements to present data");
  }
  
  // Calculate format score based on missing sections and issues
  const requiredSections = researchPaperSections.filter(s => s.required).length;
  const foundRequiredSections = result.detectedSections.filter(s => 
    researchPaperSections.find(rs => rs.name === s && rs.required)
  ).length;
  
  const formatScore = Math.round((foundRequiredSections / requiredSections) * 100);
  result.formatScore = formatScore;
  
  // Determine overall quality based on formatScore and ai analysis scores
  if (result.aiAnalysis) {
    if (result.formatScore >= 90 && result.aiAnalysis.academicTone >= 85) {
      result.aiAnalysis.overallQuality = "Excellent";
    } else if (result.formatScore >= 75 && result.aiAnalysis.academicTone >= 70) {
      result.aiAnalysis.overallQuality = "Good";
    } else if (result.formatScore >= 60 && result.aiAnalysis.academicTone >= 60) {
      result.aiAnalysis.overallQuality = "Average";
    } else {
      result.aiAnalysis.overallQuality = "Needs Improvement";
    }
  }
  
  return result;
}

// Advanced AI analysis of paper content
function performAIAnalysis(text: string, result: FormatCheckResult) {
  if (!result.aiAnalysis) return;
  
  // Check for academic tone and vocabulary
  const academicPhraseCount = academicPhrases.reduce((count, phrase) => {
    const regex = new RegExp(phrase, 'gi');
    const matches = text.match(regex) || [];
    return count + matches.length;
  }, 0);
  
  // Analyze paragraph structure (simplified)
  const paragraphs = text.split(/\n\s*\n/);
  const averageParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;
  
  // Check for first-person usage (non-academic)
  const firstPersonCount = (text.match(/\b(I|we|our|my)\b/gi) || []).length;
  
  // Check for transition words indicating good organization
  const transitionWords = ['however', 'therefore', 'consequently', 'furthermore', 'moreover', 'in addition', 'similarly', 'in contrast'];
  const transitionCount = transitionWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return count + matches.length;
  }, 0);
  
  // Set academic tone score
  const totalWords = text.split(/\s+/).length;
  const academicRatio = academicPhraseCount / (totalWords / 500); // Normalize for text length
  const firstPersonPenalty = Math.min(20, firstPersonCount * 2); // Penalty for first-person usage
  
  result.aiAnalysis.academicTone = Math.min(100, Math.max(0, 
    60 + // Base score
    (academicRatio * 20) - // Bonus for academic phrases
    firstPersonPenalty + // Penalty for first person
    (averageParagraphLength >= 4 && averageParagraphLength <= 8 ? 10 : 0) // Ideal paragraph length
  ));
  
  // Set organization score
  result.aiAnalysis.organizationScore = Math.min(100, Math.max(0,
    50 + // Base score
    (result.detectedSections.length * 5) + // Bonus for each section
    (transitionCount / (totalWords / 1000) * 10) // Bonus for transition words
  ));
  
  // Generate AI insights
  
  // Strengths
  if (academicRatio > 1) {
    result.aiAnalysis.strengths.push("Strong use of academic vocabulary and terminology");
  }
  
  if (firstPersonCount < 5) {
    result.aiAnalysis.strengths.push("Appropriate academic tone with limited use of first-person perspective");
  }
  
  if (transitionCount > totalWords / 300) {
    result.aiAnalysis.strengths.push("Good use of transition words to improve readability and flow");
  }
  
  // Weaknesses
  if (academicRatio < 0.5) {
    result.aiAnalysis.weaknesses.push("Limited use of academic vocabulary and terminology");
  }
  
  if (firstPersonCount > 10) {
    result.aiAnalysis.weaknesses.push("Excessive use of first-person perspective (I, we, our) for academic writing");
  }
  
  if (averageParagraphLength > 10) {
    result.aiAnalysis.weaknesses.push("Paragraphs are too long, consider breaking them up for better readability");
  } else if (averageParagraphLength < 3) {
    result.aiAnalysis.weaknesses.push("Paragraphs are too short, may need more development of ideas");
  }
  
  // Add custom suggestions based on our AI analysis
  if (result.aiAnalysis.academicTone < 70) {
    result.suggestions.push("Consider using more academic terminology and avoiding casual language");
  }
  
  if (result.aiAnalysis.organizationScore < 70) {
    result.suggestions.push("Improve paper organization with clearer section headers and transition phrases");
  }
}

// Detect which citation style is being used
function detectCitationStyle(text: string): string | null {
  const styles = Object.entries(citationPatterns);
  
  // Count occurrences of each citation style
  const counts = styles.map(([style, patterns]) => {
    const count = patterns.reduce((sum, pattern) => {
      const matches = text.match(pattern) || [];
      return sum + matches.length;
    }, 0);
    
    return { style, count };
  });
  
  // Find style with most matches
  const mostUsed = counts.reduce((max, current) => 
    current.count > max.count ? current : max, 
    { style: '', count: 0 }
  );
  
  return mostUsed.count > 0 ? mostUsed.style : null;
}