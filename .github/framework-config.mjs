/**
 * framework-config.mjs
 * Framework configuration for pixel-agents
 * 
 * This file tracks the framework setup for this client repository.
 * Do NOT edit manually unless you understand the implications.
 */

export const frameworkConfig = {
  client_name: 'pixel-agents',
  framework: {
    version: '2.0.0',
    source_location: '.gene2-core',
    absolute_path: '/Users/oboukhris-palo/workspace/gene2-core',
    relative_path: '../../../workspace/gene2-core',
    strategy: 'symlink-local-only',
    auto_update: true,
    git_ignored: true,
    never_commit: true,
  },
  created_at: new Date().toISOString(),
  last_verified: new Date().toISOString(),
  status: 'initialized',
};

export default frameworkConfig;
