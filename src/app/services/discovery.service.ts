import { Injectable, signal, effect } from '@angular/core';
import { SimplePool } from 'nostr-tools';

export interface ServerInfo {
  url: string;
  name: string;
  region: string;
  latency?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DiscoveryService {
  private readonly STORAGE_KEY = 'nostria-discovery-server';
  
  private servers: ServerInfo[] = [
    { url: 'https://discovery.eu.nostria.app/', name: 'discovery.eu.nostria.app', region: 'Europe' },
    { url: 'https://discovery.us.nostria.app/', name: 'discovery.us.nostria.app', region: 'USA' },
    { url: 'https://discovery.af.nostria.app/', name: 'discovery.af.nostria.app', region: 'Africa' },
    { url: 'https://purplepag.es/', name: 'purplepag.es', region: 'Germany' },
    // { url: 'https://relay.damus.io/', name: 'relay.damus.io', region: 'USA (California)' },
    // { url: 'https://relay.nostr.band/', name: 'relay.nostr.band', region: 'Finland (Helsinki)' },
    // { url: 'https://nos.lol/', name: 'nos.lol', region: 'Germany' },
    // { url: 'https://purplepag.es/', name: 'purplepag.es', region: 'Germany' },
    // { url: 'https://discovery.as.nostria.app/', name: 'discovery.as.nostria.app', region: 'Asia' },
    // { url: 'https://discovery.sa.nostria.app/', name: 'discovery.sa.nostria.app', region: 'South America' },
    // { url: 'https://discovery.au.nostria.app/', name: 'discovery.au.nostria.app', region: 'Australia' },
    // { url: 'https://discovery.jp.nostria.app/', name: 'discovery.jp.nostria.app', region: 'Japan' },
    // { url: 'https://discovery.cn.nostria.app/', name: 'discovery.cn.nostria.app', region: 'China' },
    // { url: 'https://discovery.in.nostria.app/', name: 'discovery.in.nostria.app', region: 'India' },
    // { url: 'https://discovery.me.nostria.app/', name: 'discovery.me.nostria.app', region: 'Middle East' },
  ];

  isChecking = signal<boolean>(false);
  selectedServer = signal<ServerInfo>(this.loadSavedServer() || this.servers[0]);
  progress = signal<number>(0);
  discoveryPool: SimplePool | null = null;

  constructor() {
    // Auto-save selected server whenever it changes
    effect(() => {
      const server = this.selectedServer();
      if (server) {
        this.saveSelectedServer(server);
      }
    });
  }

  getDiscoveryPool(): SimplePool {
    return this.discoveryPool || (this.discoveryPool = new SimplePool());
  }

  /**
   * Load the previously saved server from local storage
   */
  private loadSavedServer(): ServerInfo | null {
    try {
      const savedServer = localStorage.getItem(this.STORAGE_KEY);
      if (savedServer) {
        const parsedServer: ServerInfo = JSON.parse(savedServer);
        // Verify that the saved server still exists in our server list
        const serverExists = this.servers.find(s => s.url === parsedServer.url);
        if (serverExists) {
          return parsedServer;
        }
      }
    } catch (error) {
      console.error('Failed to load saved discovery server:', error);
    }
    return null;
  }

  /**
   * Save the selected server to local storage
   */
  private saveSelectedServer(server: ServerInfo): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(server));
    } catch (error) {
      console.error('Failed to save discovery server:', error);
    }
  }

  /**
   * Check if we have a previously saved server
   */
  hasSavedServer(): boolean {
    return this.loadSavedServer() !== null;
  }

  async checkServerLatency(): Promise<ServerInfo> {
    // Initially only check the first 3 servers as requested
    const serversToCheck = this.servers;
    const results: ServerInfo[] = [];

    this.isChecking.set(true);
    this.progress.set(0);

    for (let i = 0; i < serversToCheck.length; i++) {
      const server = serversToCheck[i];
      try {
        const startTime = performance.now();
        await fetch(`${server.url}`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
        });
        const endTime = performance.now();

        const serverWithLatency = {
          ...server,
          latency: Math.round(endTime - startTime)
        };

        results.push(serverWithLatency);
      } catch (error) {
        console.error(`Error checking ${server.name}:`, error);
        results.push({ ...server, latency: 9999 }); // High latency for failed servers
      }

      this.progress.set(Math.round(((i + 1) / serversToCheck.length) * 100));
    }

    // Sort by latency (lowest first) and select the best server
    results.sort((a, b) => (a.latency || 9999) - (b.latency || 9999));
    const bestServer = results[0];

    // Update all servers with their latency values
    this.servers = results;

    this.isChecking.set(false);
    this.selectedServer.set(bestServer);

    return bestServer;
  }

  /**
   * Manually select a server (e.g., from the UI dropdown)
   */
  selectServer(server: ServerInfo): void {
    this.selectedServer.set(server);
  }

  /**
   * Get current server status - checks if we should run discovery
   */
  shouldRunDiscovery(): boolean {
    return !this.hasSavedServer();
  }

  getServersByLatency(): ServerInfo[] {
    return [...this.servers].sort((a, b) => (a.latency || 9999) - (b.latency || 9999));
  }

  getAllServers(): ServerInfo[] {
    return [...this.servers];
  }
}
