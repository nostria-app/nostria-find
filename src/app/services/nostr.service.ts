import { Injectable, Signal, effect, inject, signal } from '@angular/core';
import { nip19, SimplePool, type Event, Filter } from 'nostr-tools';
import { DiscoveryService } from './discovery.service';

@Injectable({
    providedIn: 'root'
})
export class NostrService {
    // private discoverRelay = 'wss://discovery.eu.nostria.app';
    // private discoverRelay = 'wss://purplepag.es';
    private userPool: SimplePool | null = new SimplePool();

    // User signals
    private userRelays = signal<string[]>([]);
    private userProfile = signal<any>(null);
    private userEvents = signal<Event[]>([]);
    private userBadges = signal<Event[]>([]);
    private loading = signal<boolean>(false);
    private error = signal<string | null>(null);
    private readonly discovery = inject(DiscoveryService);

    constructor() {
        effect(() => {
            // Log relay list changes
            const relays = this.userRelays();
            if (relays.length > 0) {
                console.log('User relays updated:', relays);
                this.userPool = new SimplePool();
            }
        });
    }

    getUserPool(): SimplePool {
        return this.userPool || (this.userPool = new SimplePool());
    }

    // Public accessors for signals
    getUserProfile(): Signal<any> {
        return this.userProfile.asReadonly();
    }

    getUserEvents(): Signal<Event[]> {
        return this.userEvents.asReadonly();
    }

    getUserBadges(): Signal<Event[]> {
        return this.userBadges.asReadonly();
    }

    getLoading(): Signal<boolean> {
        return this.loading.asReadonly();
    }

    getError(): Signal<string | null> {
        return this.error.asReadonly();
    }

    async lookupUser(identifier: string): Promise<void> {
        this.reset();
        this.loading.set(true);

        try {
            // Parse the identifier (could be npub, hex, or note1)
            let pubkey: string;

            if (identifier.startsWith('npub')) {
                try {
                    const { data } = nip19.decode(identifier);
                    pubkey = data as string;
                } catch (e) {
                    throw new Error('Invalid npub format');
                }
            } else if (/^[0-9a-f]{64}$/.test(identifier)) {
                pubkey = identifier;
            } else {
                throw new Error('Invalid identifier. Please use npub or hex format');
            }

            // First get user relay list from discovery relay
            await this.fetchUserRelays(pubkey);

            if (this.userRelays().length === 0) {
                throw new Error('No relays found for this user');
            }

            // Then fetch profile and other data in parallel
            await Promise.all([
                this.fetchUserProfile(pubkey),
                // this.fetchUserBadges(pubkey)
            ]);

        } catch (e) {
            this.error.set((e as Error).message);
        } finally {
            this.loading.set(false);
        }
    }

    private reset(): void {
        this.userProfile.set(null);
        this.userRelays.set([]);
        this.userEvents.set([]);
        this.userBadges.set([]);
        this.error.set(null);
    }

    private async fetchUserRelays(pubkey: string): Promise<void> {
        try {
            // Query kind 10002 (relay list metadata) from discovery relay
            const relayListEvents = await this.discovery.getDiscoveryPool().get([this.discovery.selectedServer()?.url], {
                kinds: [10002],
                authors: [pubkey],
                limit: 1
            });

            if (relayListEvents) {
                const relayUrls = relayListEvents.tags.filter((tag: any) => tag[0] === 'r').map((tag: any) => tag[1]);
                this.userRelays.set(relayUrls);
            }

            //   if (relayListEvents.length > 0) {
            //     const relayList = relayListEvents[0];
            //     const relays = Object.keys(JSON.parse(relayList.content));
            //     this.userRelays.set(relays);
            //   } else {
            //     // Fallback to common relays if no list found
            //     this.userRelays.set([
            //       'wss://relay.damus.io',
            //       'wss://relay.nostr.band',
            //       'wss://nos.lol',
            //       'wss://relay.snort.social'
            //     ]);
            // }
        } catch (e) {
            console.error('Error fetching user relays:', e);
            // Set fallback relays
            this.userRelays.set([
                'wss://relay.damus.io/',
                'wss://relay.nostr.band/',
                'wss://nos.lol/',
                'wss://relay.snort.social/'
            ]);
        }
    }

    private async fetchUserProfile(pubkey: string): Promise<void> {
        // Connect to user relays and get profile data (kind 0)
        const userRelays = this.userRelays();

        try {
            const userMetadata = await this.getUserPool().get(userRelays, {
                kinds: [0],
                authors: [pubkey],
                limit: 1
            });

            if (userMetadata) {
                try {
                    const profileData = JSON.parse(userMetadata.content);
                    this.userProfile.set({
                        pubkey,
                        npub: nip19.npubEncode(pubkey),
                        ...profileData
                    });
                } catch (e) {
                    console.error('Error parsing profile data:', e);
                    this.error.set('Could not parse profile data');
                }
            } else {
                this.userProfile.set({ pubkey, npub: nip19.npubEncode(pubkey) });
            }
        } catch (e) {
            console.error('Error fetching user profile:', e);
        }
    }

    // private async fetchUserBadges(pubkey: string): Promise<void> {
    //     // Connect to user relays and get badges (kind 30009)
    //     const userRelays = this.userRelays();

    //     try {
    //         const badgeEvents = await this.pool.get(userRelays, [{
    //             kinds: [30009],
    //             authors: [pubkey],
    //             limit: 10
    //         }]);

    //         if (badgeEvents.length > 0) {
    //             this.userBadges.set(badgeEvents);
    //         }
    //     } catch (e) {
    //         console.error('Error fetching user badges:', e);
    //     }
    // }

    // Close pool connections when done
    closeConnections(): void {
        if (this.userPool) {
            this.userPool.close(this.userRelays());
            this.userPool = null;
        }
    }
}
