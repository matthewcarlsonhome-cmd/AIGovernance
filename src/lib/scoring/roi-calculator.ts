import type { RoiInputs, RoiResults, SensitivityRow, EnhancedRoiInputs, EnhancedRoiResults, ScenarioAnalysis } from '@/types';

const DISCOUNT_RATE = 0.10; // 10% annual discount rate for NPV
const MONTHS_PER_YEAR = 12;

export function calculateRoi(inputs: RoiInputs): RoiResults {
  const {
    team_size,
    avg_salary,
    current_velocity,
    projected_velocity_lift,
    license_cost_per_user,
    implementation_cost,
    training_cost,
  } = inputs;

  // Productivity gain = effective additional developer capacity
  const velocity_multiplier = projected_velocity_lift / 100;
  const effective_additional_capacity = team_size * velocity_multiplier;
  const monthly_salary_per_dev = avg_salary / MONTHS_PER_YEAR;

  // Monthly savings = value of additional output
  const monthly_savings = effective_additional_capacity * monthly_salary_per_dev;
  const annual_savings = monthly_savings * MONTHS_PER_YEAR;

  // Annual costs
  const annual_license_cost = license_cost_per_user * team_size * MONTHS_PER_YEAR;
  const total_annual_cost = annual_license_cost + implementation_cost + training_cost;

  // Net benefit
  const net_annual_benefit = annual_savings - total_annual_cost;

  // Payback period (months)
  const total_upfront = implementation_cost + training_cost;
  const monthly_net = monthly_savings - (annual_license_cost / MONTHS_PER_YEAR);
  const payback_months = monthly_net > 0
    ? Math.ceil(total_upfront / monthly_net)
    : Infinity;

  // 3-year NPV
  const three_year_npv = calculateNPV(net_annual_benefit, total_upfront, 3, DISCOUNT_RATE);

  // ROI percentage
  const roi_percentage = total_annual_cost > 0
    ? ((net_annual_benefit / total_annual_cost) * 100)
    : 0;

  return {
    monthly_savings: Math.round(monthly_savings),
    annual_savings: Math.round(annual_savings),
    total_annual_cost: Math.round(total_annual_cost),
    net_annual_benefit: Math.round(net_annual_benefit),
    payback_months: payback_months === Infinity ? 999 : payback_months,
    three_year_npv: Math.round(three_year_npv),
    roi_percentage: Math.round(roi_percentage * 10) / 10,
  };
}

function calculateNPV(annualBenefit: number, upfrontCost: number, years: number, rate: number): number {
  let npv = -upfrontCost;
  for (let year = 1; year <= years; year++) {
    npv += annualBenefit / Math.pow(1 + rate, year);
  }
  return npv;
}

export function calculateSensitivity(inputs: RoiInputs): SensitivityRow[] {
  const lifts = [10, 20, 30, 40, 50, 60, 70, 80];
  return lifts.map(velocity_lift => {
    const modifiedInputs = { ...inputs, projected_velocity_lift: velocity_lift };
    const results = calculateRoi(modifiedInputs);
    return {
      velocity_lift,
      monthly_savings: results.monthly_savings,
      annual_savings: results.annual_savings,
      payback_months: results.payback_months,
      three_year_npv: results.three_year_npv,
    };
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Enhanced ROI Calculator with TCO, IRR, Scenarios
// ---------------------------------------------------------------------------

const SCENARIO_CONFIGS: Omit<ScenarioAnalysis, 'npv' | 'roi'>[] = [
  { scenario: 'optimistic', probability: 0.20, revenue_multiplier: 1.30, cost_multiplier: 0.90 },
  { scenario: 'base', probability: 0.50, revenue_multiplier: 1.00, cost_multiplier: 1.00 },
  { scenario: 'conservative', probability: 0.25, revenue_multiplier: 0.70, cost_multiplier: 1.15 },
  { scenario: 'pessimistic', probability: 0.05, revenue_multiplier: 0.40, cost_multiplier: 1.40 },
];

export function calculateEnhancedRoi(inputs: EnhancedRoiInputs): EnhancedRoiResults {
  // Base ROI
  const base = calculateRoi(inputs);

  // TCO calculations
  const tco_initial = inputs.implementation_cost + inputs.training_cost
    + (inputs.infrastructure_cost || 0)
    + (inputs.data_engineering_cost || 0)
    + (inputs.change_management_cost || 0);

  const annual_license = inputs.license_cost_per_user * inputs.team_size * 12;
  const annual_infra = inputs.ongoing_infrastructure || 0;
  const annual_support = (inputs.ongoing_support_fte || 0) * (inputs.support_fte_salary || 0);
  const tco_annual = annual_license + annual_infra + annual_support;
  const tco_three_year = tco_initial + (tco_annual * 3);

  // Benefit breakdown
  const productivity = base.annual_savings;
  const revenue = (inputs.revenue_increase_pct || 0) / 100 * productivity;
  const error_savings = (inputs.error_reduction_pct || 0) / 100 * (inputs.error_cost_annual || 0);
  const cost_reduction = productivity - revenue;

  const total_annual_benefit = productivity + revenue + error_savings;
  const net_annual = total_annual_benefit - tco_annual;

  // 5-year cashflows
  const five_year_cashflows: number[] = [];
  for (let y = 0; y < 5; y++) {
    if (y === 0) {
      five_year_cashflows.push(-tco_initial + net_annual * 0.5); // Half year ramp
    } else {
      five_year_cashflows.push(net_annual);
    }
  }

  // IRR calculation (Newton-Raphson approximation)
  const irr = calculateIRR([-tco_initial, ...five_year_cashflows.slice(0).map((_, i) => i === 0 ? net_annual * 0.5 : net_annual)]);

  // Scenario analysis
  const scenarios: ScenarioAnalysis[] = SCENARIO_CONFIGS.map(cfg => {
    const adjBenefit = total_annual_benefit * cfg.revenue_multiplier;
    const adjCost = tco_annual * cfg.cost_multiplier;
    const adjNet = adjBenefit - adjCost;
    const adjInitial = tco_initial * cfg.cost_multiplier;
    const npv = calculateNPV(adjNet, adjInitial, 3, DISCOUNT_RATE);
    const roi = adjCost > 0 ? ((adjNet / (adjCost + adjInitial / 3)) * 100) : 0;
    return { ...cfg, npv: Math.round(npv), roi: Math.round(roi * 10) / 10 };
  });

  const expected_npv = Math.round(
    scenarios.reduce((sum, s) => sum + s.npv * s.probability, 0)
  );

  return {
    ...base,
    total_annual_cost: Math.round(tco_annual + tco_initial / 3),
    net_annual_benefit: Math.round(net_annual),
    tco_initial: Math.round(tco_initial),
    tco_annual: Math.round(tco_annual),
    tco_three_year: Math.round(tco_three_year),
    irr: Math.round(irr * 1000) / 10,
    scenarios,
    expected_npv,
    five_year_cashflows: five_year_cashflows.map(Math.round),
    benefit_breakdown: {
      revenue: Math.round(revenue),
      cost_reduction: Math.round(cost_reduction),
      error_savings: Math.round(error_savings),
      productivity: Math.round(productivity),
    },
  };
}

function calculateIRR(cashflows: number[], guess = 0.1, maxIter = 100, tolerance = 0.0001): number {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let derivative = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const discounted = cashflows[t] / Math.pow(1 + rate, t);
      npv += discounted;
      if (t > 0) {
        derivative -= t * cashflows[t] / Math.pow(1 + rate, t + 1);
      }
    }
    if (Math.abs(npv) < tolerance) return rate;
    if (Math.abs(derivative) < 1e-10) return rate;
    rate = rate - npv / derivative;
    if (rate < -0.99) rate = -0.5;
    if (rate > 10) rate = 5;
  }
  return rate;
}
