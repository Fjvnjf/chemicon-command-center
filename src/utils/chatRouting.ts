import type { ChatInsight } from '@/stores/app'

export interface ChatRouteTarget {
  category: ChatInsight['category']
  routeName: string
  label: string
  reason: string
}

const competitorPatterns = [
  /\bcompetitors?\b/i,
  /\bcompetition\b/i,
  /\brivals?\b/i,
  /\bcompare\b/i,
  /\bcomparison\b/i,
  /\bbenchmark\b/i,
  /\bpositioning\b/i,
  /\bmarket share\b/i,
  /\bvs\.?\b/i,
  /\bversus\b/i,
  /\btransfar\b/i,
  /\brunhe\b/i,
  /\bdymatic\b/i,
  /\bhuntsman\b/i,
  /\brudolf\b/i,
  /\barchroma\b/i,
]

const marketPatterns = [
  /\bmarket\b/i,
  /\bindustry\b/i,
  /\bdemand\b/i,
  /\bsupply\b/i,
  /\bpricing?\b/i,
  /\bprice\b/i,
  /\bmargin\b/i,
  /\bgrowth\b/i,
  /\btrend\b/i,
  /\bforecast\b/i,
  /\bsegment\b/i,
  /\bcustomer\b/i,
  /\bexport\b/i,
  /\bimport\b/i,
  /\bchina\b/i,
  /\bbangladesh\b/i,
  /\btextile\b/i,
  /\bauxiliar(?:y|ies)\b/i,
  /\bsoftener\b/i,
  /\besterquat\b/i,
  /\bcwas\b/i,
  /\bcwms\b/i,
]

const investmentPatterns = [
  /\binvest(?:ment|or|ors|ing)?\b/i,
  /\bfinancial\b/i,
  /\bfinance\b/i,
  /\broi\b/i,
  /\birr\b/i,
  /\bnpv\b/i,
  /\bpayback\b/i,
  /\bbreak[- ]?even\b/i,
  /\bcapex\b/i,
  /\bopex\b/i,
  /\bprofit\b/i,
  /\brevenue\b/i,
  /\bcost\b/i,
  /\bplant\b/i,
  /\bfactory\b/i,
  /\bcapacity\b/i,
  /\bmt\/yr\b/i,
]

const commandPatterns = [
  /\banaly[sz]e\b/i,
  /\bcheck\b/i,
  /\bresearch\b/i,
  /\bfind\b/i,
  /\bcompare\b/i,
  /\bcalculate\b/i,
  /\bestimate\b/i,
  /\bverify\b/i,
  /\bvalidate\b/i,
  /\bmake\b/i,
  /\bcreate\b/i,
  /\bprepare\b/i,
  /\bsummarize\b/i,
  /\bupdate\b/i,
  /\badd\b/i,
  /\bsave\b/i,
]

function matchesAny(text: string, patterns: RegExp[]) {
  return patterns.some(pattern => pattern.test(text))
}

function addUnique(targets: ChatRouteTarget[], target: ChatRouteTarget) {
  if (!targets.some(t => t.category === target.category && t.routeName === target.routeName)) {
    targets.push(target)
  }
}

export function routeChatCommand(text: string): ChatRouteTarget[] {
  const normalized = text.trim()
  const targets: ChatRouteTarget[] = []

  const explicitMarket = /(?:@market|#market|save\s+(?:to|in)\s+market|market\s+analysis)/i.test(normalized)
  const explicitCompetitor = /(?:@competitors?|#competitors?|save\s+(?:to|in)\s+competitors?|competitor\s+analysis)/i.test(normalized)
  const explicitBoth = /(?:@both|#both|market\s+(?:and|&)\s+competitors?|competitors?\s+(?:and|&)\s+market|both\s+tabs|both\s+sections)/i.test(normalized)

  if (explicitBoth || explicitMarket || matchesAny(normalized, marketPatterns)) {
    addUnique(targets, {
      category: 'market',
      routeName: 'marketAnalysis',
      label: 'Market Analysis',
      reason: explicitMarket || explicitBoth ? 'explicit market instruction' : 'market/business keywords',
    })
  }

  if (explicitBoth || explicitCompetitor || matchesAny(normalized, competitorPatterns)) {
    addUnique(targets, {
      category: 'competitor',
      routeName: 'competitors',
      label: 'Competitors',
      reason: explicitCompetitor || explicitBoth ? 'explicit competitor instruction' : 'competitor/comparison keywords',
    })
  }

  if (matchesAny(normalized, investmentPatterns)) {
    addUnique(targets, {
      category: 'investment',
      routeName: 'marketAnalysis',
      label: 'Investment / Financial Analysis',
      reason: 'investment/financial keywords',
    })
  }

  // If it is a business command but does not clearly match a section, keep it visible in Market Analysis
  // instead of losing it in chat-only history.
  if (targets.length === 0 && matchesAny(normalized, commandPatterns)) {
    addUnique(targets, {
      category: 'market',
      routeName: 'marketAnalysis',
      label: 'Market Analysis',
      reason: 'general business command fallback',
    })
  }

  if (targets.length === 0) {
    addUnique(targets, {
      category: 'general',
      routeName: 'chat',
      label: 'Chat only',
      reason: 'no business section detected',
    })
  }

  return targets
}

export function summarizeRouteTargets(targets: ChatRouteTarget[]) {
  const visible = targets.filter(t => t.category !== 'general')
  if (visible.length === 0) return 'Chat only'
  return visible.map(t => t.label).join(', ')
}
