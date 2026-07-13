import type { TowerConfig } from '../types';

export const TOWERS: TowerConfig[] = [
  {
    id: 'firewall',
    name: 'Firewall',
    description: 'Signature-based packet filter that blocks known threats without touching legitimate traffic.',
    cost: 100,
    targetingMode: 'first',
    canHitLegitimate: false,
    upgrades: [
      { level: 1, damage: 20, range: 120, fireRate: 1000, description: 'Basic ACL rules' },
      { level: 2, damage: 35, range: 140, fireRate: 850, description: 'Stateful inspection' },
      { level: 3, damage: 55, range: 160, fireRate: 700, description: 'Next-gen deep packet inspection' },
    ],
  },
  {
    id: 'ids',
    name: 'IDS',
    description: 'Intrusion Detection System with high damage output but may flag legitimate traffic as malicious.',
    cost: 150,
    targetingMode: 'strongest',
    canHitLegitimate: true,
    upgrades: [
      { level: 1, damage: 40, range: 150, fireRate: 1200, description: 'Signature-based detection' },
      { level: 2, damage: 65, range: 170, fireRate: 1000, description: 'Anomaly detection' },
      { level: 3, damage: 100, range: 190, fireRate: 800, description: 'ML-powered behavioral analysis' },
    ],
  },
  {
    id: 'waf',
    name: 'WAF',
    description: 'Web Application Firewall specializing in injection and social engineering attacks.',
    cost: 200,
    targetingMode: 'first',
    canHitLegitimate: true,
    bonusVs: ['sql_injection', 'phishing'],
    upgrades: [
      { level: 1, damage: 30, range: 130, fireRate: 900, description: 'OWASP Top 10 rules' },
      { level: 2, damage: 50, range: 150, fireRate: 750, description: 'Custom rule engine' },
      { level: 3, damage: 75, range: 170, fireRate: 600, description: 'Positive security model' },
    ],
  },
  {
    id: 'honeypot',
    name: 'Honeypot',
    description: 'Decoy system that lures and slows threats. Minimal damage but powerful crowd control.',
    cost: 75,
    targetingMode: 'area',
    canHitLegitimate: false,
    upgrades: [
      { level: 1, damage: 0, range: 100, fireRate: 2000, slowFactor: 0.5, description: 'Low-interaction honeypot' },
      { level: 2, damage: 8, range: 120, fireRate: 1800, slowFactor: 0.35, description: 'High-interaction honeypot' },
      { level: 3, damage: 15, range: 150, fireRate: 1500, slowFactor: 0.2, description: 'Honeynet with full OS emulation' },
    ],
  },
  {
    id: 'rate_limiter',
    name: 'Rate Limiter',
    description: 'Throttles all traffic passing through its zone, including legitimate requests.',
    cost: 125,
    targetingMode: 'area',
    canHitLegitimate: true,
    upgrades: [
      { level: 1, damage: 10, range: 110, fireRate: 1500, slowFactor: 0.6, description: 'Fixed window counter' },
      { level: 2, damage: 18, range: 130, fireRate: 1300, slowFactor: 0.45, description: 'Sliding window log' },
      { level: 3, damage: 28, range: 150, fireRate: 1100, slowFactor: 0.3, description: 'Token bucket with burst allowance' },
    ],
  },
  {
    id: 'packet_inspector',
    name: 'Packet Inspector',
    description: 'Deep analysis tower that reveals stealthed threats. Cannot target legitimate traffic.',
    cost: 250,
    targetingMode: 'closest',
    canHitLegitimate: false,
    reveals: true,
    upgrades: [
      { level: 1, damage: 35, range: 140, fireRate: 1400, description: 'Header analysis' },
      { level: 2, damage: 55, range: 160, fireRate: 1200, description: 'Payload reconstruction' },
      { level: 3, damage: 80, range: 180, fireRate: 1000, description: 'TLS interception + certificate validation' },
    ],
  },
];
