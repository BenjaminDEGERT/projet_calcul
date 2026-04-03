import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { foundry } from 'wagmi/chains';

export const besuLocal = defineChain({
  id: 1337,
  name: 'Besu Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8546'] },
  },
});

export const config = getDefaultConfig({
  appName: 'VeriDegree',
  projectId: 'b05f87ea8f5da2b86e047f21065a5fa1',
  chains: [foundry, besuLocal],
  ssr: true,
});