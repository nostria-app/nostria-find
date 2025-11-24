import { Injectable } from '@angular/core';
import { nip19 } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class NostrUtilsService {

  /**
   * Checks if a string is a valid hex string (64 characters, only hex digits)
   */
  isValidHex(input: string): boolean {
    return /^[0-9a-f]{64}$/i.test(input);
  }

  /**
   * Checks if a string is a valid npub
   */
  isValidNpub(input: string): boolean {
    try {
      if (!input.startsWith('npub')) return false;
      const { data, type } = nip19.decode(input);
      return type === 'npub' && typeof data === 'string' && this.isValidHex(data);
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if a string is a valid nprofile
   */
  isValidNprofile(input: string): boolean {
    try {
      if (!input.startsWith('nprofile1')) return false;
      const { data, type } = nip19.decode(input);
      return type === 'nprofile' && typeof data === 'object' && 'pubkey' in data && this.isValidHex(data.pubkey);
    } catch (e) {
      return false;
    }
  }

  /**
   * Converts hex to npub
   */
  hexToNpub(hex: string): string {
    if (!this.isValidHex(hex)) {
      throw new Error('Invalid hex string');
    }
    return nip19.npubEncode(hex);
  }

  /**
   * Converts npub to hex
   */
  npubToHex(npub: string): string {
    try {
      if (!npub.startsWith('npub')) {
        throw new Error('Invalid npub format');
      }
      const { data, type } = nip19.decode(npub);
      if (type !== 'npub' || typeof data !== 'string') {
        throw new Error('Invalid npub format');
      }
      return data;
    } catch (e) {
      throw new Error('Invalid npub format');
    }
  }

  /**
   * Converts nprofile to hex
   */
  nprofileToHex(nprofile: string): string {
    try {
      if (!nprofile.startsWith('nprofile1')) {
        throw new Error('Invalid nprofile format');
      }
      const { data, type } = nip19.decode(nprofile);
      if (type !== 'nprofile' || typeof data !== 'object' || !('pubkey' in data)) {
        throw new Error('Invalid nprofile format');
      }
      return data.pubkey;
    } catch (e) {
      throw new Error('Invalid nprofile format');
    }
  }

  /**
   * Converts nprofile to npub
   */
  nprofileToNpub(nprofile: string): string {
    const hex = this.nprofileToHex(nprofile);
    return this.hexToNpub(hex);
  }

  /**
   * Parses input and converts hex to npub if needed
   * Returns npub if input is hex, returns input as-is if already npub
   * Converts nprofile to npub if input is nprofile
   */
  parseInputToNpub(input: string): string {
    const trimmedInput = input.trim();
    
    if (this.isValidHex(trimmedInput)) {
      return this.hexToNpub(trimmedInput);
    }
    
    if (this.isValidNpub(trimmedInput)) {
      return trimmedInput;
    }
    
    if (this.isValidNprofile(trimmedInput)) {
      return this.nprofileToNpub(trimmedInput);
    }
    
    throw new Error('Invalid input format. Please use npub, nprofile, or hex format');
  }

  /**
   * Parses npub to hex, but leaves hex as-is
   * Used for profile component to handle both hex URLs and npub inputs
   * Also handles nprofile format
   */
  parseToHex(input: string): string {
    const trimmedInput = input.trim();
    
    if (this.isValidHex(trimmedInput)) {
      return trimmedInput;
    }
    
    if (this.isValidNpub(trimmedInput)) {
      return this.npubToHex(trimmedInput);
    }
    
    if (this.isValidNprofile(trimmedInput)) {
      return this.nprofileToHex(trimmedInput);
    }
    
    throw new Error('Invalid input format. Please use npub, nprofile, or hex format');
  }
}
