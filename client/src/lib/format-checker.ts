// Research paper format checking service

export interface FormatSection {
  name: string;
  required: boolean;
  expectedLength?: [number, number]; // Min and max words
  patterns?: RegExp[]; // Patterns to look for in this section
}

export interface FormatCheckResult {
  missingRequiredSections: string[];
  sectionLengthIssues: { section: string; issue: string }[];
  formatScore: number; // 0-100
  suggestions: string[];
  detectedSections: string[];
}

// Define expected sections and their requirements
const researchPaperSections: FormatSection[] = [
  {
    name: "Abstract",
    required: true,
    expectedLength: [150, 300],
    patterns: [/summariz(e|es|ed|ing)/i, /this (paper|research|study)/i]
  },
  {
    name: "Introduction",
    required: true,
    expectedLength: [500, 1000],
    patterns: [/introduc(e|es|ed|ing)/i, /background/i, /purpose/i]
  },
  {
    name: "Literature Review",
    required: true,
    expectedLength: [800, 2000],
    patterns: [/literature/i, /review/i, /previous (research|studies|work)/i]
  },
  {
    name: "Methodology",
    required: true,
    expectedLength: [600, 1500],
    patterns: [/method(s|ology)?/i, /approach/i, /data collection/i, /experiment/i]
  },
  {
    name: "Results",
    required: true,
    expectedLength: [600, 1500],
    patterns: [/result(s)?/i, /finding(s)?/i, /analysis/i, /data/i]
  },
  {
    name: "Discussion",
    required: true,
    expectedLength: [800, 1800],
    patterns: [/discuss(ion)?/i, /interpret(ation)?/i, /implic(ation|ations)/i]
  },
  {
    name: "Conclusion",
    required: true,
    expectedLength: [300, 800],
    patterns: [/conclu(de|sion)/i, /summary/i, /future (work|research)/i]
  },
  {
    name: "References",
    required: true,
    patterns: [/reference(s)?/i, /bibliograph(y|ies)/i, /citation(s)?/i]
  }
];

// Patterns to identify citation styles
const citationPatterns = {
  apa: [/\(\w+,\s+\d{4}\)/, /\w+\s+\(\d{4}\)/],
  mla: [/\(\w+\s+\d+\)/, /\w+\s+\d+/],
  chicago: [/\d+\.\s+/, /\[\d+\]/],
  harvard: [/\(\w+\s+\d{4}\)/, /\w+\s+\d{4}/],
};

// Check text extracted from PDF for formatting issues
export function checkResearchPaperFormat(text: string): FormatCheckResult {
  const result: FormatCheckResult = {
    missingRequiredSections: [],
    sectionLengthIssues: [],
    formatScore: 0,
    suggestions: [],
    detectedSections: []
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
  
  // Rough estimation of section lengths (simplistic approach)
  // In a real implementation, we would need to parse the PDF more intelligently
  const totalWords = text.match(/\\b\\w+\\b/g)?.length || 0;
  
  if (totalWords < 3000) {
    result.suggestions.push("Paper appears to be shorter than the recommended length (3000+ words)");
  }
  
  // Check for citation consistency
  const citationStyle = detectCitationStyle(text);
  if (citationStyle) {
    result.suggestions.push(`Detected citation style appears to be ${citationStyle}`);
  } else {
    result.suggestions.push("No consistent citation style detected. Consider using APA, MLA, or Chicago style consistently");
  }
  
  // Check for figures and tables
  const hasFigures = /figure \d+|fig\. \d+/i.test(text);
  const hasTables = /table \d+/i.test(text);
  
  if (!hasFigures && !hasTables) {
    result.suggestions.push("Consider adding figures or tables to illustrate your findings");
  }
  
  // Calculate format score based on missing sections and issues
  const requiredSections = researchPaperSections.filter(s => s.required).length;
  const foundRequiredSections = result.detectedSections.filter(s => 
    researchPaperSections.find(rs => rs.name === s && rs.required)
  ).length;
  
  const formatScore = Math.round((foundRequiredSections / requiredSections) * 100);
  result.formatScore = formatScore;
  
  return result;
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