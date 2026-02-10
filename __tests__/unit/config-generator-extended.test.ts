import { describe, it, expect } from 'vitest';
import {
  generateManagedSettings,
  generateRequirementsToml,
  generateClaudeMd,
  generateDockerCompose,
  generateDevcontainer,
  generateTerraform,
  generateAllConfigFiles,
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

describe('Config Generator - Extended', () => {
  describe('generateDockerCompose', () => {
    it('should return a ConfigFile with yaml type', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.file_type).toBe('yaml');
      expect(result.filename).toBe('docker-compose.yml');
    });

    it('should include sandbox_config_id', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.sandbox_config_id).toBe(DEFAULT_CONFIG.id);
    });

    it('should include docker compose version', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.content).toContain('version');
    });

    it('should include sandbox-workspace service', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.content).toContain('sandbox-workspace');
    });

    it('should include proxy service', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.content).toContain('proxy');
    });

    it('should include audit-logger service', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.content).toContain('audit-logger');
    });

    it('should include network configuration with vpc_cidr', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.content).toContain(DEFAULT_CONFIG.vpc_cidr);
    });

    it('should use default vpc_cidr when not provided', () => {
      const config = { ...DEFAULT_CONFIG, vpc_cidr: undefined };
      const result = generateDockerCompose(config);
      expect(result.content).toContain('10.100.0.0/16');
    });

    it('should include SANDBOX_MODE environment variable', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.content).toContain('SANDBOX_MODE=true');
    });

    it('should include security_opt no-new-privileges', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.content).toContain('no-new-privileges');
    });

    it('should have a description', () => {
      const result = generateDockerCompose(DEFAULT_CONFIG);
      expect(result.description.length).toBeGreaterThan(10);
    });
  });

  describe('generateDevcontainer', () => {
    it('should return a ConfigFile with json type', () => {
      const result = generateDevcontainer(DEFAULT_CONFIG);
      expect(result.file_type).toBe('json');
      expect(result.filename).toContain('devcontainer.json');
    });

    it('should generate valid JSON content', () => {
      const result = generateDevcontainer(DEFAULT_CONFIG);
      expect(() => JSON.parse(result.content)).not.toThrow();
    });

    it('should include sandbox_config_id', () => {
      const result = generateDevcontainer(DEFAULT_CONFIG);
      expect(result.sandbox_config_id).toBe(DEFAULT_CONFIG.id);
    });

    it('should include claude-code extension', () => {
      const result = generateDevcontainer(DEFAULT_CONFIG);
      const parsed = JSON.parse(result.content);
      const extensions = parsed.customizations?.vscode?.extensions || [];
      expect(extensions).toContain('anthropics.claude-code');
    });

    it('should include CLOUD_PROVIDER in containerEnv', () => {
      const result = generateDevcontainer(DEFAULT_CONFIG);
      const parsed = JSON.parse(result.content);
      expect(parsed.containerEnv.CLOUD_PROVIDER).toBe(DEFAULT_CONFIG.cloud_provider);
    });

    it('should include REGION in containerEnv', () => {
      const result = generateDevcontainer(DEFAULT_CONFIG);
      const parsed = JSON.parse(result.content);
      expect(parsed.containerEnv.REGION).toBe(DEFAULT_CONFIG.region);
    });

    it('should include SANDBOX_MODE in containerEnv', () => {
      const result = generateDevcontainer(DEFAULT_CONFIG);
      const parsed = JSON.parse(result.content);
      expect(parsed.containerEnv.SANDBOX_MODE).toBe('true');
    });
  });

  describe('generateTerraform', () => {
    it('should return a ConfigFile with hcl type', () => {
      const result = generateTerraform(DEFAULT_CONFIG);
      expect(result.file_type).toBe('hcl');
      expect(result.filename).toBe('main.tf');
    });

    it('should include sandbox_config_id', () => {
      const result = generateTerraform(DEFAULT_CONFIG);
      expect(result.sandbox_config_id).toBe(DEFAULT_CONFIG.id);
    });

    it('should generate AWS terraform for aws provider', () => {
      const result = generateTerraform({ ...DEFAULT_CONFIG, cloud_provider: 'aws' });
      expect(result.content).toContain('hashicorp/aws');
      expect(result.content).toContain('aws_vpc');
    });

    it('should generate GCP terraform for gcp provider', () => {
      const result = generateTerraform({ ...DEFAULT_CONFIG, cloud_provider: 'gcp' });
      expect(result.content).toContain('hashicorp/google');
      expect(result.content).toContain('google_compute_network');
    });

    it('should generate Azure terraform for azure provider', () => {
      const result = generateTerraform({ ...DEFAULT_CONFIG, cloud_provider: 'azure' });
      expect(result.content).toContain('hashicorp/azurerm');
      expect(result.content).toContain('azurerm_virtual_network');
    });

    it('should generate generic terraform for on_premises provider', () => {
      const result = generateTerraform({ ...DEFAULT_CONFIG, cloud_provider: 'on_premises' });
      expect(result.content).toContain('On-Premises');
      expect(result.content).toContain('TODO');
    });

    it('should include the region in the terraform config', () => {
      const result = generateTerraform(DEFAULT_CONFIG);
      expect(result.content).toContain(DEFAULT_CONFIG.region);
    });

    it('should include the vpc_cidr in the terraform config', () => {
      const result = generateTerraform(DEFAULT_CONFIG);
      expect(result.content).toContain(DEFAULT_CONFIG.vpc_cidr);
    });

    it('should include description with cloud provider', () => {
      const result = generateTerraform(DEFAULT_CONFIG);
      expect(result.description).toContain('aws');
    });
  });

  describe('generateAllConfigFiles', () => {
    it('should return 6 config files', () => {
      const result = generateAllConfigFiles(DEFAULT_CONFIG, 'Test Project');
      expect(result).toHaveLength(6);
    });

    it('should include all file types', () => {
      const result = generateAllConfigFiles(DEFAULT_CONFIG, 'Test Project');
      const filenames = result.map((f) => f.filename);
      expect(filenames).toContain('managed-settings.json');
      expect(filenames).toContain('requirements.toml');
      expect(filenames).toContain('CLAUDE.md');
      expect(filenames).toContain('docker-compose.yml');
      expect(filenames).toContain('.devcontainer/devcontainer.json');
      expect(filenames).toContain('main.tf');
    });

    it('should all reference the same sandbox_config_id', () => {
      const result = generateAllConfigFiles(DEFAULT_CONFIG, 'Test Project');
      result.forEach((f) => {
        expect(f.sandbox_config_id).toBe(DEFAULT_CONFIG.id);
      });
    });

    it('should all have non-empty content', () => {
      const result = generateAllConfigFiles(DEFAULT_CONFIG, 'Test Project');
      result.forEach((f) => {
        expect(f.content.length).toBeGreaterThan(0);
      });
    });

    it('should all have descriptions', () => {
      const result = generateAllConfigFiles(DEFAULT_CONFIG, 'Test Project');
      result.forEach((f) => {
        expect(f.description.length).toBeGreaterThan(0);
      });
    });

    it('should all have created_at timestamps', () => {
      const result = generateAllConfigFiles(DEFAULT_CONFIG, 'Test Project');
      result.forEach((f) => {
        expect(f.created_at).toBeTruthy();
      });
    });
  });

  describe('generateManagedSettings - extended', () => {
    it('should include anthropic endpoints for anthropic provider', () => {
      const config = { ...DEFAULT_CONFIG, settings: { ...DEFAULT_CONFIG.settings, ai_provider: 'anthropic' } };
      const result = generateManagedSettings(config);
      const parsed = JSON.parse(result.content);
      expect(parsed['claude-code.allowedApiEndpoints']).toContain('api.anthropic.com');
    });

    it('should include openai endpoints for openai provider', () => {
      const config = { ...DEFAULT_CONFIG, settings: { ...DEFAULT_CONFIG.settings, ai_provider: 'openai' } };
      const result = generateManagedSettings(config);
      const parsed = JSON.parse(result.content);
      expect(parsed['claude-code.allowedApiEndpoints']).toContain('api.openai.com');
    });

    it('should include both endpoints for both provider', () => {
      const config = { ...DEFAULT_CONFIG, settings: { ...DEFAULT_CONFIG.settings, ai_provider: 'both' } };
      const result = generateManagedSettings(config);
      const parsed = JSON.parse(result.content);
      const endpoints = parsed['claude-code.allowedApiEndpoints'];
      expect(endpoints).toContain('api.anthropic.com');
      expect(endpoints).toContain('api.openai.com');
    });

    it('should always include package registries in allowed endpoints', () => {
      const result = generateManagedSettings(DEFAULT_CONFIG);
      const parsed = JSON.parse(result.content);
      const endpoints = parsed['claude-code.allowedApiEndpoints'];
      expect(endpoints).toContain('registry.npmjs.org');
      expect(endpoints).toContain('pypi.org');
    });

    it('should enable sandbox mode', () => {
      const result = generateManagedSettings(DEFAULT_CONFIG);
      const parsed = JSON.parse(result.content);
      expect(parsed['claude-code.sandboxMode']).toBe(true);
    });

    it('should enable audit logging', () => {
      const result = generateManagedSettings(DEFAULT_CONFIG);
      const parsed = JSON.parse(result.content);
      expect(parsed['claude-code.auditLog.enabled']).toBe(true);
    });
  });

  describe('generateRequirementsToml - extended', () => {
    it('should include security settings', () => {
      const result = generateRequirementsToml(DEFAULT_CONFIG);
      expect(result.content).toContain('dlp_enabled = true');
      expect(result.content).toContain('secrets_scanning = true');
      expect(result.content).toContain('audit_logging = true');
    });

    it('should include runtime versions', () => {
      const result = generateRequirementsToml(DEFAULT_CONFIG);
      expect(result.content).toContain('node_version');
      expect(result.content).toContain('python_version');
    });

    it('should include network section with vpc_cidr', () => {
      const result = generateRequirementsToml(DEFAULT_CONFIG);
      expect(result.content).toContain(`vpc_cidr = "${DEFAULT_CONFIG.vpc_cidr}"`);
    });

    it('should use default vpc_cidr when not provided', () => {
      const config = { ...DEFAULT_CONFIG, vpc_cidr: undefined };
      const result = generateRequirementsToml(config);
      expect(result.content).toContain('vpc_cidr = "10.100.0.0/16"');
    });

    it('should include limits section', () => {
      const result = generateRequirementsToml(DEFAULT_CONFIG);
      expect(result.content).toContain('max_concurrent_sessions');
      expect(result.content).toContain('max_tokens_per_day');
      expect(result.content).toContain('storage_gb');
    });
  });
});
