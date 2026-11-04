/**
 * ruleEvaluator.ts
 * Single Responsibility: Evaluates message text against keyword rule sets.
 */

export interface RuleEvaluationMatches {
  hasDemoIntent: boolean;
  hasPricingIntent: boolean;
  hasUrgentSentiment: boolean;
  hasHandoffRequest: boolean;
}

export function evaluateMessageRules(
  text: string,
  config: {
    demoKeywords: string[];
    pricingKeywords: string[];
    urgentKeywords: string[];
    autoHandoffKeywords: string[];
  }
): RuleEvaluationMatches {
  if (!text) {
    return {
      hasDemoIntent: false,
      hasPricingIntent: false,
      hasUrgentSentiment: false,
      hasHandoffRequest: false,
    };
  }

  const cleanText = text.toLowerCase();

  const matchesAny = (keywords: string[]) =>
    keywords.some((kw) => kw && cleanText.includes(kw.toLowerCase().trim()));

  return {
    hasDemoIntent: matchesAny(config.demoKeywords),
    hasPricingIntent: matchesAny(config.pricingKeywords),
    hasUrgentSentiment: matchesAny(config.urgentKeywords),
    hasHandoffRequest: matchesAny(config.autoHandoffKeywords),
  };
}
