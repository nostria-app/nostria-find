import { TestBed } from '@angular/core/testing';
import { NostrUtilsService } from './nostr-utils.service';

describe('NostrUtilsService', () => {
  let service: NostrUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NostrUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate hex strings correctly', () => {
    const validHex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d';
    const invalidHex = 'not-hex';
    const shortHex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459';

    expect(service.isValidHex(validHex)).toBe(true);
    expect(service.isValidHex(invalidHex)).toBe(false);
    expect(service.isValidHex(shortHex)).toBe(false);
  });

  it('should validate npub strings correctly', () => {
    const validNpub = 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6';
    const invalidNpub = 'npub-invalid';
    const notNpub = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d';

    expect(service.isValidNpub(validNpub)).toBe(true);
    expect(service.isValidNpub(invalidNpub)).toBe(false);
    expect(service.isValidNpub(notNpub)).toBe(false);
  });

  it('should convert hex to npub', () => {
    const hex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d';
    const expectedNpub = 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6';
    
    const result = service.hexToNpub(hex);
    expect(result).toBe(expectedNpub);
  });

  it('should convert npub to hex', () => {
    const npub = 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6';
    const expectedHex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d';
    
    const result = service.npubToHex(npub);
    expect(result).toBe(expectedHex);
  });

  it('should parse input to npub correctly', () => {
    const hex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d';
    const npub = 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6';
    
    expect(service.parseInputToNpub(hex)).toBe(npub);
    expect(service.parseInputToNpub(npub)).toBe(npub);
    expect(() => service.parseInputToNpub('invalid')).toThrow();
  });

  it('should parse to hex correctly', () => {
    const hex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d';
    const npub = 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6';
    
    expect(service.parseToHex(hex)).toBe(hex);
    expect(service.parseToHex(npub)).toBe(hex);
    expect(() => service.parseToHex('invalid')).toThrow();
  });
});
