import { describe, it, expect } from 'vitest';
import {
  calculateRoi,
  calculateSensitivity,
  formatCurrency,
  formatPercent,
} from '@/lib/scoring/roi-calculator';
import type { RoiInputs } from '@/types';

const DEFAULT_INPUTS: RoiInputs = {
  team_size: 20,
  avg_salary: 150000,
  current_velocity: 40,
  projected_velocity_lift: 40,
  license_cost_per_user: 50,
  implementation_cost: 25000,
  training_cost: 10000,
};

describe('ROI Calculator', () => {
  describe('calculateRoi', () => {
    it('should return all required result fields', () => {
      const results = calculateRoi(DEFAULT_INPUTS);

      expect(results).toHaveProperty('monthly_savings');
      expect(results).toHaveProperty('annual_savings');
      expect(results).toHaveProperty('total_annual_cost');
      expect(results).toHaveProperty('net_annual_benefit');
      expect(results).toHaveProperty('payback_months');
      expect(results).toHaveProperty('three_year_npv');
      expect(results).toHaveProperty('roi_percentage');
    });

    it('should calculate positive savings for positive velocity lift', () => {
      const results = calculateRoi(DEFAULT_INPUTS);
      expect(results.monthly_savings).toBeGreaterThan(0);
      expect(results.annual_savings).toBeGreaterThan(0);
    });

    it('should have annual_savings = monthly_savings * 12', () => {
      const results = calculateRoi(DEFAULT_INPUTS);
      expect(results.annual_savings).toBe(results.monthly_savings * 12);
    });

    it('should include license, implementation, and training in total cost', () => {
      const results = calculateRoi(DEFAULT_INPUTS);
      const expectedLicenseCost = DEFAULT_INPUTS.license_cost_per_user * DEFAULT_INPUTS.team_size * 12;
      const expectedTotal = expectedLicenseCost + DEFAULT_INPUTS.implementation_cost + DEFAULT_INPUTS.training_cost;
      expect(results.total_annual_cost).toBe(expectedTotal);
    });

    it('should calculate net benefit as savings minus cost', () => {
      const results = calculateRoi(DEFAULT_INPUTS);
      expect(results.net_annual_benefit).toBe(results.annual_savings - results.total_annual_cost);
    });

    it('should have positive payback period', () => {
      const results = calculateRoi(DEFAULT_INPUTS);
      expect(results.payback_months).toBeGreaterThan(0);
    });

    it('should scale with team size', () => {
      const small = calculateRoi({ ...DEFAULT_INPUTS, team_size: 5 });
      const large = calculateRoi({ ...DEFAULT_INPUTS, team_size: 50 });
      expect(large.annual_savings).toBeGreaterThan(small.annual_savings);
    });

    it('should scale with velocity lift', () => {
      const low = calculateRoi({ ...DEFAULT_INPUTS, projected_velocity_lift: 10 });
      const high = calculateRoi({ ...DEFAULT_INPUTS, projected_velocity_lift: 80 });
      expect(high.annual_savings).toBeGreaterThan(low.annual_savings);
    });

    it('should handle zero velocity lift', () => {
      const results = calculateRoi({ ...DEFAULT_INPUTS, projected_velocity_lift: 0 });
      expect(results.monthly_savings).toBe(0);
      expect(results.annual_savings).toBe(0);
    });

    it('should handle very high costs gracefully', () => {
      const results = calculateRoi({
        ...DEFAULT_INPUTS,
        license_cost_per_user: 10000,
        implementation_cost: 1000000,
      });
      expect(results.net_annual_benefit).toBeLessThan(0);
      expect(results.roi_percentage).toBeLessThan(0);
    });

    it('should return integer values (no floating point)', () => {
      const results = calculateRoi(DEFAULT_INPUTS);
      expect(Number.isInteger(results.monthly_savings)).toBe(true);
      expect(Number.isInteger(results.annual_savings)).toBe(true);
      expect(Number.isInteger(results.total_annual_cost)).toBe(true);
      expect(Number.isInteger(results.net_annual_benefit)).toBe(true);
      expect(Number.isInteger(results.three_year_npv)).toBe(true);
    });
  });

  describe('calculateSensitivity', () => {
    it('should return 8 rows for different velocity lifts', () => {
      const rows = calculateSensitivity(DEFAULT_INPUTS);
      expect(rows).toHaveLength(8);
    });

    it('should include velocity lifts from 10% to 80%', () => {
      const rows = calculateSensitivity(DEFAULT_INPUTS);
      expect(rows[0].velocity_lift).toBe(10);
      expect(rows[rows.length - 1].velocity_lift).toBe(80);
    });

    it('should have increasing savings with increasing lift', () => {
      const rows = calculateSensitivity(DEFAULT_INPUTS);
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i].annual_savings).toBeGreaterThan(rows[i - 1].annual_savings);
      }
    });

    it('should have decreasing payback with increasing lift', () => {
      const rows = calculateSensitivity(DEFAULT_INPUTS);
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i].payback_months).toBeLessThanOrEqual(rows[i - 1].payback_months);
      }
    });

    it('each row should have all required fields', () => {
      const rows = calculateSensitivity(DEFAULT_INPUTS);
      rows.forEach(row => {
        expect(row).toHaveProperty('velocity_lift');
        expect(row).toHaveProperty('monthly_savings');
        expect(row).toHaveProperty('annual_savings');
        expect(row).toHaveProperty('payback_months');
        expect(row).toHaveProperty('three_year_npv');
      });
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers with $ and commas', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });

    it('should format negative numbers', () => {
      const result = formatCurrency(-5000);
      expect(result).toContain('5,000');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });
  });

  describe('formatPercent', () => {
    it('should format positive percentages with +', () => {
      expect(formatPercent(40)).toBe('+40.0%');
    });

    it('should format negative percentages with -', () => {
      expect(formatPercent(-10)).toBe('-10.0%');
    });

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('+0.0%');
    });
  });
});
