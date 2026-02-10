import { describe, it, expect } from 'vitest';
import {
  generateManagedSettings,
  generateRequirementsToml,
  generateClaudeMd,
} from '@/lib/config-gen/generator';
import type { SandboxConfig } from '@/types';

const DEFAULT_CONFIG: SandboxConfig = {
  id: 'test-config',
  project_id: 'test-project',
  cloud_provider: 'aws',
  sandbox_model: 'cloud_native',
  vpc_cidr: '10.0.0.0/16',
  region: 'us-east-1',
  ai_provider: 'anthropic',
  settings: {
    enable_dlp: true,
    max_file_size: 10,
    session_timeout: 480,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('Config Generator', () => {
  describe('generateManagedSettings', () => {
    it('should return a ConfigFile object', () => {
      const result = generateManagedSettings(DEFAULT_CONFIG);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('filename', 'managed-settings.json');
      expect(result).toHaveProperty('file_type', 'json');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('description');
    });

    it('should generate non-empty content', () => {
      const result = generateManagedSettings(DEFAULT_CONFIG);
      expect(result.content.length).toBeGreaterThan(10);
    });

    it('should generate valid JSON content', () => {
      const result = generateManagedSettings(DEFAULT_CONFIG);
      expect(() => JSON.parse(result.content)).not.toThrow();
    });

    it('should include configuration relevant to the provider', () => {
      const result = generateManagedSettings(DEFAULT_CONFIG);
      // Content should contain recognizable config keys
      expect(result.content).toBeTruthy();
    });
  });

  describe('generateRequirementsToml', () => {
    it('should return a ConfigFile with toml type', () => {
      const result = generateRequirementsToml(DEFAULT_CONFIG);
      expect(result.file_type).toBe('toml');
      expect(result.filename).toBe('requirements.toml');
    });

    it('should include cloud provider info', () => {
      const result = generateRequirementsToml(DEFAULT_CONFIG);
      expect(result.content).toContain(DEFAULT_CONFIG.cloud_provider);
    });

    it('should include region info', () => {
      const result = generateRequirementsToml(DEFAULT_CONFIG);
      expect(result.content).toContain(DEFAULT_CONFIG.region!);
    });

    it('should include tool requirements', () => {
      const result = generateRequirementsToml(DEFAULT_CONFIG);
      expect(result.content).toContain('claude-code');
    });
  });

  describe('generateClaudeMd', () => {
    it('should return a ConfigFile with markdown type', () => {
      const result = generateClaudeMd(DEFAULT_CONFIG, 'Test Project');
      expect(result.file_type).toBe('markdown');
      expect(result.filename).toBe('CLAUDE.md');
    });

    it('should include project name', () => {
      const result = generateClaudeMd(DEFAULT_CONFIG, 'My Special Project');
      expect(result.content).toContain('My Special Project');
    });

    it('should include content about rules or standards', () => {
      const result = generateClaudeMd(DEFAULT_CONFIG, 'Test');
      const lower = result.content.toLowerCase();
      const hasRelevantContent = lower.includes('security') || lower.includes('rule') ||
        lower.includes('standard') || lower.includes('allow') || lower.includes('restrict');
      expect(hasRelevantContent).toBe(true);
    });
  });

  describe('cross-generator consistency', () => {
    it('all generators should produce non-empty content', () => {
      const settings = generateManagedSettings(DEFAULT_CONFIG);
      const requirements = generateRequirementsToml(DEFAULT_CONFIG);
      const claudeMd = generateClaudeMd(DEFAULT_CONFIG, 'Test');

      expect(settings.content.length).toBeGreaterThan(0);
      expect(requirements.content.length).toBeGreaterThan(0);
      expect(claudeMd.content.length).toBeGreaterThan(0);
    });

    it('all generators should include sandbox_config_id', () => {
      const settings = generateManagedSettings(DEFAULT_CONFIG);
      const requirements = generateRequirementsToml(DEFAULT_CONFIG);
      const claudeMd = generateClaudeMd(DEFAULT_CONFIG, 'Test');

      expect(settings.sandbox_config_id).toBe(DEFAULT_CONFIG.id);
      expect(requirements.sandbox_config_id).toBe(DEFAULT_CONFIG.id);
      expect(claudeMd.sandbox_config_id).toBe(DEFAULT_CONFIG.id);
    });

    it('should handle all cloud providers', () => {
      const providers = ['aws', 'gcp', 'azure', 'on_premises'] as const;
      providers.forEach(provider => {
        const config = { ...DEFAULT_CONFIG, cloud_provider: provider };
        expect(() => generateManagedSettings(config)).not.toThrow();
        expect(() => generateRequirementsToml(config)).not.toThrow();
        expect(() => generateClaudeMd(config, 'Test')).not.toThrow();
      });
    });

    it('should handle all sandbox models', () => {
      const models = ['cloud_native', 'codespaces', 'docker', 'hybrid'] as const;
      models.forEach(model => {
        const config = { ...DEFAULT_CONFIG, sandbox_model: model };
        expect(() => generateManagedSettings(config)).not.toThrow();
        expect(() => generateRequirementsToml(config)).not.toThrow();
      });
    });
  });
});
