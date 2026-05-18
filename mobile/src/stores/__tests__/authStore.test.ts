import { useAuthStore } from '../authStore';
import authService from '../../services/auth';

jest.mock('../../i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
  },
}));

jest.mock('../../services/auth', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    isLoggedIn: jest.fn(),
    getCurrentUser: jest.fn(),
    clearAuth: jest.fn(),
  },
}));

const mockedAuth = authService as jest.Mocked<typeof authService>;

describe('authStore', () => {
  beforeEach(() => {
    const store = useAuthStore.getState();
    useAuthStore.setState({
      user: null,
      gamification: null,
      isLoading: false,
      isAuthenticated: false,
      isDemoMode: false,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isDemoMode).toBe(false);
    });
  });

  describe('setUser', () => {
    it('sets user and marks authenticated', () => {
      const user = { id: '1', email: 'test@test.com', name: 'Test' } as any;
      useAuthStore.getState().setUser(user);
      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('clears authentication when user is null', () => {
      useAuthStore.getState().setUser({ id: '1' } as any);
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe('setGamification', () => {
    it('sets gamification data', () => {
      const gam = { id: 'g1', userId: '1' } as any;
      useAuthStore.getState().setGamification(gam);
      expect(useAuthStore.getState().gamification).toEqual(gam);
    });
  });

  describe('login', () => {
    it('sets user on successful login', async () => {
      const user = { id: '1', email: 'test@test.com', name: 'Test' };
      mockedAuth.login.mockResolvedValue({ token: 'jwt', user });

      await useAuthStore.getState().login('test@test.com', 'pass');

      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('re-throws error and resets loading on failure', async () => {
      mockedAuth.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(useAuthStore.getState().login('t@t.com', 'wrong')).rejects.toThrow('Invalid credentials');
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('sets user on successful registration', async () => {
      const user = { id: '2', email: 'new@test.com', name: 'New' };
      mockedAuth.register.mockResolvedValue({ token: 'jwt', user });

      await useAuthStore.getState().register({ email: 'new@test.com', password: 'pass', name: 'New' });

      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('re-throws error on failure', async () => {
      mockedAuth.register.mockRejectedValue(new Error('Email taken'));

      await expect(
        useAuthStore.getState().register({ email: 'x@x.com', password: 'p', name: 'X' }),
      ).rejects.toThrow('Email taken');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('loginMock', () => {
    it('sets mock user and demo mode', async () => {
      await useAuthStore.getState().loginMock();

      const state = useAuthStore.getState();
      expect(state.user).toBeTruthy();
      expect(state.user?.email).toBe('mock@user.com');
      expect(state.isDemoMode).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears all auth state', async () => {
      useAuthStore.setState({ user: { id: '1' } as any, isAuthenticated: true, isDemoMode: true });
      mockedAuth.logout.mockResolvedValue();

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.gamification).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isDemoMode).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('still clears state even if API logout fails', async () => {
      useAuthStore.setState({ user: { id: '1' } as any, isAuthenticated: true });
      mockedAuth.logout.mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('keeps demo session when isDemoMode and user exists', async () => {
      useAuthStore.setState({ isDemoMode: true, user: { id: 'mock' } as any });

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(mockedAuth.isLoggedIn).not.toHaveBeenCalled();
    });

    it('clears auth when not logged in', async () => {
      mockedAuth.isLoggedIn.mockResolvedValue(false);

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('sets user when logged in and API succeeds', async () => {
      const user = { id: '1', email: 'a@a.com', name: 'A' };
      mockedAuth.isLoggedIn.mockResolvedValue(true);
      mockedAuth.getCurrentUser.mockResolvedValue(user);

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('clears auth when getCurrentUser fails', async () => {
      mockedAuth.isLoggedIn.mockResolvedValue(true);
      mockedAuth.getCurrentUser.mockRejectedValue(new Error('Expired'));

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(mockedAuth.clearAuth).toHaveBeenCalled();
    });
  });

  describe('updateHourlyRate', () => {
    it('updates hourly rate on existing user', () => {
      useAuthStore.setState({ user: { id: '1', hourlyRate: 100 } as any });
      useAuthStore.getState().updateHourlyRate(200);
      expect(useAuthStore.getState().user?.hourlyRate).toBe(200);
    });

    it('does nothing when no user', () => {
      useAuthStore.getState().updateHourlyRate(200);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
