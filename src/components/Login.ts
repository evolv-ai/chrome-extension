import { AuthService } from '../services/auth';

export class Login {
  private authService: AuthService;

  constructor() {
    console.log('Login class constructor called');
    this.authService = AuthService.getInstance();
  }

  public async initialize(): Promise<void> {
    console.log('Login initialize called');
    try {
      await this.authService.initialize();
      console.log('Auth service initialized successfully');
      this.setupEventListeners();
      await this.checkAuthenticationStatus();
    } catch (error) {
      console.error('Login initialization failed:', error);
    }
  }

  private setupEventListeners(): void {
    console.log('Setting up event listeners');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userInfo = document.getElementById('user-info');

    console.log('Login button found:', !!loginButton);
    console.log('Logout button found:', !!logoutButton);
    console.log('User info element found:', !!userInfo);

    if (loginButton) {
      loginButton.addEventListener('click', async () => {
        console.log('Login button clicked');
        try {
          await this.authService.login();
          console.log('Login successful');
          this.checkAuthenticationStatus();
        } catch (error) {
          console.error('Login failed:', error);
        }
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        console.log('Logout button clicked');
        try {
          await this.authService.logout();
          console.log('Logout successful');
          this.checkAuthenticationStatus();
        } catch (error) {
          console.error('Logout failed:', error);
        }
      });
    }
  }

  private async checkAuthenticationStatus(): Promise<void> {
    try {
      const isAuthenticated = await this.authService.isAuthenticated();
      console.log('Authentication check completed:', isAuthenticated);
      this.updateUI(isAuthenticated);
    } catch (error) {
      console.error('Authentication check failed:', error);
      this.updateUI(false);
    }
  }

  private async updateUI(isAuthenticated: boolean): Promise<void> {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userInfo = document.getElementById('user-info');

    if (loginButton) {
      loginButton.style.display = isAuthenticated ? 'none' : 'block';
    }

    if (logoutButton) {
      logoutButton.style.display = isAuthenticated ? 'block' : 'none';
    }

    if (userInfo) {
      if (isAuthenticated) {
        const user = await this.authService.getUser();
        userInfo.textContent = `Welcome, ${user.name || user.email}!`;
        userInfo.style.display = 'block';
      } else {
        userInfo.style.display = 'none';
      }
    }
  }
} 
