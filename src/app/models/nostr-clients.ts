export interface NostrClient {
  name: string;
  url: string;
  logo: string;
  description?: string;
}

export const NOSTR_CLIENTS: NostrClient[] = [
  {
    name: 'Nostria',
    url: 'https://nostria.app/p/{npub}',
    logo: 'assets/client-logos/nostria.svg',
    description: 'Web/Desktop/iOS/Android client'
  },
  {
    name: 'Default Nostr Client',
    url: 'web+nostr://{npub}',
    logo: 'assets/client-logos/nostr.webp',
    description: 'Launch using the default Nostr client on your device'
  },
  {
    name: 'Damus',
    url: 'https://damus.io/{npub}',
    logo: 'assets/client-logos/damus.png',
    description: 'iOS/MacOS client'
  },
  {
    name: 'Snort',
    url: 'https://snort.social/p/{npub}',
    logo: 'assets/client-logos/snort.svg',
    description: 'Web client'
  },
  {
    name: 'Nostree',
    url: 'https://nostree.me/{npub}',
    logo: 'assets/client-logos/nostree.svg',
    description: 'Web client'
  },
  {
    name: 'Coracle',
    url: 'https://coracle.social/{npub}',
    logo: 'assets/client-logos/coracle.webp',
    description: 'Web client'
  },
  {
    name: 'Primal',
    url: 'https://primal.net/p/{npub}',
    logo: 'assets/client-logos/primal.svg',
    description: 'Web/iOS/Android client'
  },
  {
    name: 'Iris',
    url: 'https://iris.to/{npub}',
    logo: 'assets/client-logos/iris.svg',
    description: 'Web client'
  },
  {
    name: 'Nostter',
    url: 'https://nostter.app/{npub}',
    logo: 'assets/client-logos/nostter.svg',
    description: 'Web client'
  },
];
