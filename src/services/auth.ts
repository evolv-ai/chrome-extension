import { createAuth0Client, Auth0Client, GetTokenSilentlyOptions } from '@auth0/auth0-spa-js';

export class AuthService {
  private auth0Client: Auth0Client | null = null;
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async initialize(): Promise<void> {
    console.log('Initializing Auth0 client');
    this.auth0Client = await createAuth0Client({
      domain: 'login-newdev.evolvdev.com', // Replace with your Auth0 domain
      clientId: 'vhiKi5X3R4qPY0NUt9oHGX7tmXQmEBKd', // Replace with your Auth0 client ID
      authorizationParams: {
        redirect_uri: window.location.href,
        // audience: 'YOUR_API_IDENTIFIER', // Optional: Replace with your API identifier if needed
      },
    });
  }

  public async login(): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      console.log('Login with popup', window.location.href);
      await this.auth0Client.loginWithPopup({
        authorizationParams: { redirect_uri: window.location.href }
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async handleRedirectCallback(): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      await this.auth0Client.handleRedirectCallback();
    } catch (error) {
      console.error('Redirect callback error:', error);
      throw error;
    }
  }

  public async getToken(options?: GetTokenSilentlyOptions): Promise<string> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      return await this.auth0Client.getTokenSilently(options);
    } catch (error) {
      console.error('Get token error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      await this.auth0Client.logout({
        logoutParams: {
          returnTo: chrome.identity.getRedirectURL()
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      return await this.auth0Client.isAuthenticated();
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  public async getUser(): Promise<any> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      return await this.auth0Client.getUser();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
} 
