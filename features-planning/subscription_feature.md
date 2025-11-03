# Subscription Feature Specification

## Overview

Implement a subscription-based monetization system that allows users to access SkatteABC with usage-based pricing tiers. The system should track usage per personal billing period and integrate with Stripe for payment processing.

## Business Model

### Pricing Strategy

- **Freemium approach**: Start with limited free access to build user base
- **Monthly recurring billing**: Predictable revenue stream
- **Usage-based tiers**: Scale with customer value

### Proposed Pricing Tiers

```javascript
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Gratis',
    monthlyQueryLimit: 5,
    priceMonthly: 0,
    estimatedCostPerMonth: 0.64, // 5 × 0.128 kr
    features: ['5 skattefrågor/måned', 'Grunnleggende svar'],
  },
  basic: {
    name: 'Basic',
    monthlyQueryLimit: 100,
    priceMonthly: 9900, // 99 kr
    estimatedCostPerMonth: 12.8, // 100 × 0.128 kr
    estimatedMargin: 86.2, // 87%
    features: ['100 skattefrågor/måned', 'Detaljerte svar', 'Email støtte'],
  },
  pro: {
    name: 'Pro',
    monthlyQueryLimit: 500,
    priceMonthly: 29900, // 299 kr
    estimatedCostPerMonth: 64, // 500 × 0.128 kr
    estimatedMargin: 235, // 79%
    features: ['500 skattefrågor/måned', 'Prioritert støtte', 'Telefon støtte'],
  },
};
```

## Technical Implementation

### Database Schema

#### User Subscriptions

```sql
CREATE TABLE user_subscriptions (
  subscription_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  plan_name VARCHAR(20) NOT NULL, -- references SUBSCRIPTION_PLANS constant
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Usage Tracking (Personal Billing Periods)

```sql
CREATE TABLE usage_periods (
  usage_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  query_count INTEGER DEFAULT 0,
  last_query_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, period_start)
);
```

### Key Features

#### 1. Personal Billing Cycles

- **Problem**: Calendar month billing gives unfair advantage to late-month signups
- **Solution**: Each user has personal 30-day billing cycle starting from subscription date
- **Implementation**: Track `current_period_start` and `current_period_end` per subscription

#### 2. Usage Quota Management

```javascript
// Quota checking logic
async function checkQuota(userId: number): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId);
  const plan = SUBSCRIPTION_PLANS[subscription.plan_name];

  if (!plan.monthlyQueryLimit) return true; // unlimited

  const currentUsage = await getCurrentPeriodUsage(userId, subscription);
  return currentUsage < plan.monthlyQueryLimit;
}

// Usage tracking per query
async function trackQuery(userId: number) {
  const subscription = await getUserActiveSubscription(userId);

  await prisma.usage_periods.upsert({
    where: {
      user_id_period_start: {
        user_id: userId,
        period_start: subscription.current_period_start
      }
    },
    update: {
      query_count: { increment: 1 },
      last_query_at: new Date()
    },
    create: {
      user_id: userId,
      period_start: subscription.current_period_start,
      period_end: subscription.current_period_end,
      query_count: 1,
      last_query_at: new Date()
    }
  });
}
```

#### 3. Stripe Integration

- **Subscription management**: Create/update/cancel subscriptions
- **Webhook handling**: Sync subscription status changes
- **Customer portal**: Self-service billing management
- **Payment retry**: Handle failed payments gracefully

## Cost Analysis

### OpenAI API Costs (Per Query)

```
Embedding (text-embedding-3-small): ~0.027 øre
Chat completion (GPT-4o):
  - Input (2500 tokens): ~6.25 øre
  - Output (600 tokens): ~6.0 øre
Total per query: ~12.8 øre
```

### Margin Analysis

```
Basic Plan (100 queries/month @ 99kr):
  Revenue: 99 kr/month
  Cost: 100 × 0.128 kr = 12.8 kr/month
  Margin: 86.2 kr (87% margin)

Pro Plan (500 queries/month @ 299kr):
  Revenue: 299 kr/month
  Cost: 500 × 0.128 kr = 64 kr/month
  Margin: 235 kr (79% margin)
```

### Cost Optimization Opportunities

1. **Smart model selection**: Use GPT-4o-mini for simple queries (10x cheaper)
2. **Response caching**: Cache popular answers to reduce API calls
3. **Context optimization**: Trim context to reduce input token costs

## Business Projections

### Customer Acquisition

- **Target market**: 50,000+ småbedrifter in Norway
- **Secondary market**: 650,000+ individuals with complex tax situations
- **Customer Acquisition Cost**: 200-1,250 kr per customer
- **Break-even**: 50-100 Basic subscribers

### Revenue Projections

```
Year 1: 100 customers → 120,000 kr annual revenue
Year 2: 500 customers → 600,000 kr annual revenue
Year 3: 1000 customers → 1,200,000 kr annual revenue
```

### Scaling Milestones

- **Month 1-6**: Launch freemium, validate product-market fit
- **Month 7-12**: Introduce Basic plan, optimize conversion
- **Month 13-24**: Add Pro plan, focus on customer acquisition
- **Month 25+**: Enterprise features, potential exit opportunities

## Success Metrics

### Key Performance Indicators (KPIs)

- **Monthly Active Users (MAU)**
- **Conversion rate**: Free → Paid
- **Customer Lifetime Value (CLV)**
- **Monthly Recurring Revenue (MRR)**
- **Churn rate**
- **Average queries per user**
- **Support ticket volume**

### Target Metrics (Month 12)

- **500+ total users**
- **100+ paying subscribers**
- **5% free-to-paid conversion rate**
- **<5% monthly churn rate**
- **50,000+ kr MRR**

## Implementation Timeline

### Phase 1 (Month 1): Foundation

- [ ] Database schema implementation
- [ ] Usage tracking system
- [ ] Basic quota enforcement
- [ ] Free tier launch

### Phase 2 (Month 2): Payments

- [ ] Stripe integration
- [ ] Subscription management UI
- [ ] Webhook handling
- [ ] Basic plan launch

### Phase 3 (Month 3): Optimization

- [ ] Usage analytics dashboard
- [ ] Customer portal integration
- [ ] Email notifications for usage limits
- [ ] Pro plan launch

### Phase 4 (Month 4+): Growth

- [ ] Referral program
- [ ] Enterprise features
- [ ] API access
- [ ] Advanced analytics
