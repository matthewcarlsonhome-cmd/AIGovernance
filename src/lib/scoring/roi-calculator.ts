import type { RoiInputs, RoiResults, SensitivityRow } from '@/types';

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
