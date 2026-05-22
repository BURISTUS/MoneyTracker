import { useSubscriptionStore } from '../subscriptionStore';
import type { SubscriptionStatus, FeatureKey } from '../../types';

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();

jest.mock('../../services/api', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

jest.mock('../../services/family', () => ({
  familyService: {
    getMyFamily: jest.fn(() => Promise.resolve(null)),
    getBudget: jest.fn(() => Promise.resolve(null)),
    create: jest.fn(() => Promise.resolve({})),
    join: jest.fn(() => Promise.resolve()),
  },
  FamilyInfo: undefined,
  FamilyBudget: undefined,
}));

jest.mock('../../i18n', () => ({
  __esModule: true,
  default: { t: (key: string) => key },
}));

describe('subscriptionStore', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      status: null,
      isLoading: false,
      error: null,
      paywallFeature: null,
      family: null,
      familyBudget: null,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('has null status', () => {
      expect(useSubscriptionStore.getState().status).toBeNull();
    });
  });

  describe('checkAccess', () => {
    it('returns default features when no status', () => {
      const access = useSubscriptionStore.getState().checkAccess('LIFE_COST' as FeatureKey);
      expect(access?.allowed).toBe(true);
    });

    it('returns AI_CHAT not allowed by default', () => {
      const access = useSubscriptionStore.getState().checkAccess('AI_CHAT' as FeatureKey);
      expect(access?.allowed).toBe(false);
    });

    it('returns feature from status when available', () => {
      useSubscriptionStore.setState({
        status: {
          plan: 'premium',
          isPremium: true,
          features: { AI_CHAT: { allowed: true } },
        } as unknown as SubscriptionStatus,
      });

      const access = useSubscriptionStore.getState().checkAccess('AI_CHAT' as FeatureKey);
      expect(access?.allowed).toBe(true);
    });
  });

  describe('isPremium', () => {
    it('returns false when no status', () => {
      expect(useSubscriptionStore.getState().isPremium()).toBe(false);
    });

    it('returns true when status says premium', () => {
      useSubscriptionStore.setState({
        status: { isPremium: true } as SubscriptionStatus,
      });
      expect(useSubscriptionStore.getState().isPremium()).toBe(true);
    });
  });

  describe('plan', () => {
    it('returns free by default', () => {
      expect(useSubscriptionStore.getState().plan()).toBe('free');
    });

    it('returns premium when status says so', () => {
      useSubscriptionStore.setState({
        status: { plan: 'premium' } as SubscriptionStatus,
      });
      expect(useSubscriptionStore.getState().plan()).toBe('premium');
    });
  });

  describe('showPaywall', () => {
    it('returns true and sets paywall feature when not allowed', () => {
      const result = useSubscriptionStore.getState().showPaywall('AI_CHAT' as FeatureKey);
      expect(result).toBe(true);
      expect(useSubscriptionStore.getState().paywallFeature).toBe('AI_CHAT');
    });

    it('returns false when feature is allowed', () => {
      const result = useSubscriptionStore.getState().showPaywall('LIFE_COST' as FeatureKey);
      expect(result).toBe(false);
      expect(useSubscriptionStore.getState().paywallFeature).toBeNull();
    });
  });

  describe('closePaywall', () => {
    it('clears paywall feature', () => {
      useSubscriptionStore.setState({ paywallFeature: 'AI_CHAT' as FeatureKey });
      useSubscriptionStore.getState().closePaywall();
      expect(useSubscriptionStore.getState().paywallFeature).toBeNull();
    });
  });

  describe('fetchStatus', () => {
    it('sets status from API', async () => {
      const status = { plan: 'premium', isPremium: true, features: {} };
      mockApiGet.mockResolvedValue({ data: status });

      await useSubscriptionStore.getState().fetchStatus();

      expect(useSubscriptionStore.getState().status).toEqual(status);
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });

    it('sets error on failure', async () => {
      mockApiGet.mockRejectedValue(new Error('Network'));

      await useSubscriptionStore.getState().fetchStatus();

      expect(useSubscriptionStore.getState().error).toBe('Network');
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });
  });

  describe('accountLimit', () => {
    it('returns default 3 when no status', () => {
      expect(useSubscriptionStore.getState().accountLimit()).toBe(3);
    });

    it('returns limit from status', () => {
      useSubscriptionStore.setState({
        status: { accountLimit: 10 } as unknown as SubscriptionStatus,
      });
      expect(useSubscriptionStore.getState().accountLimit()).toBe(10);
    });
  });

  describe('allowedAccountTypes', () => {
    it('returns default CASH and BANK', () => {
      expect(useSubscriptionStore.getState().allowedAccountTypes()).toEqual(['CASH', 'BANK']);
    });
  });

  describe('clearFamily', () => {
    it('clears family data', () => {
      useSubscriptionStore.setState({
        family: { id: '1' } as any,
        familyBudget: { totalSpent: 100 } as any,
      });
      useSubscriptionStore.getState().clearFamily();
      expect(useSubscriptionStore.getState().family).toBeNull();
      expect(useSubscriptionStore.getState().familyBudget).toBeNull();
    });
  });
});
