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
  const explicitBusiness = /(?:@business|#business|business\s+cards?|save\s+(?:to|in)\s+business)/i.test(normalized)
  const explicitBoth = /(?:@both|#both|market\s+(?:and|&)\s+competitors?|competitors?\s+(?:and|&)\s+market|both\s+tabs|both\s+sections)/i.test(normalized)

  const hasInvestment = matchesAny(normalized, investmentPatterns)
  const hasCompetitor = matchesAny(normalized, competitorPatterns)
  const hasMarket = matchesAny(normalized, marketPatterns)
  const hasStrongMarket = matchesAny(normalized, marketPatterns.filter(pattern => !/china|bangladesh|textile|auxiliar|softener|esterquat|cwas|cwms/i.test(pattern.source)))
  const slashCommandOnly = /^\s*\/(?:usage|status|goal)\b/i.test(normalized)

  if (explicitBusiness) {
    addUnique(targets, {
      category: hasInvestment ? 'investment' : 'general',
      routeName: 'businessCards',
      label: 'Business Cards',
      reason: 'explicit business card instruction',
    })
  }

  if (explicitBoth || explicitMarket || (!explicitBusiness && hasMarket && (!hasInvestment || hasStrongMarket))) {
    addUnique(targets, {
      category: 'market',
      routeName: 'marketAnalysis',
      label: 'Market Analysis',
      reason: explicitMarket || explicitBoth ? 'explicit market instruction' : hasInvestment ? 'market-specific + investment keywords' : 'market/business keywords',
    })
  }

  if (explicitBoth || explicitCompetitor || (!explicitBusiness && hasCompetitor)) {
    addUnique(targets, {
      category: 'competitor',
      routeName: 'competitors',
      label: 'Competitors',
      reason: explicitCompetitor || explicitBoth ? 'explicit competitor instruction' : 'competitor/comparison keywords',
    })
  }

  if (hasInvestment && !targets.some(t => t.routeName === 'businessCards')) {
    addUnique(targets, {
      category: 'investment',
      routeName: 'businessCards',
      label: 'Business Cards',
      reason: 'investment/financial keywords need a dedicated visual card tab',
    })
  }

  // If it is a dashboard/business command but does not clearly match a specialist tab,
  // route it to Business Cards so the user always sees a visible result instead of a hidden chat-only answer.
  if (targets.length === 0 && matchesAny(normalized, commandPatterns)) {
    addUnique(targets, {
      category: 'general',
      routeName: 'businessCards',
      label: 'Business Cards',
      reason: 'general business command fallback / no existing section matched',
    })
  }

  if (targets.length === 0 && !slashCommandOnly && normalized.length > 12) {
    addUnique(targets, {
      category: 'general',
      routeName: 'businessCards',
      label: 'Business Cards',
      reason: 'default visual answer capture so every substantial chat message has a dashboard card',
    })
  }

  if (targets.length === 0) {
    addUnique(targets, {
      category: 'general',
      routeName: 'chat',
      label: 'Chat only',
      reason: 'status/slash command or no substantial dashboard content detected',
    })
  }

  return targets
}

export function summarizeRouteTargets(targets: ChatRouteTarget[]) {
  const visible = targets.filter(t => t.routeName !== 'chat')
  if (visible.length === 0) return 'Chat only'
  return [...new Set(visible.map(t => t.label))].join(', ')
}
