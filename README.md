# Packet Express

Network security tower defense game for HoboCon.

Players deploy security defenses (firewalls, IDS, WAF, honeypots) to block malicious network traffic while allowing legitimate packets through. False positives cost you.

## Development

```bash
pnpm install
pnpm run dev        # Start dev server
pnpm test           # Run unit + integration tests
pnpm run build      # Production build
```

## Stack

- Phaser 3.90 + TypeScript + Vite 6
- Vitest + Playwright (testing)
- PWA with offline support

## For HoboCon

Built for the hacker/security conference on a train from KC to Chicago.
