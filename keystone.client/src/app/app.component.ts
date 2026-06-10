import { Component, OnInit, Output, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser';
import { RoleService } from './Service/role.service';
import { EncryptionService } from './Service/encryption.service';
import { SessionService } from './Service/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  @Output() appCode = '';
  isAppReady: boolean = false;
  isStandAlonePage: boolean = false;
  private baseUrl = environment.apiUrl;
  isLoggedIn = false;
  public userName: string = '';
  public userAccount: string = '';
  userRoles: string[] = [];

  private readonly destroying$ = new Subject<void>();

  //Session Services
  private sessionService = inject(SessionService);
  private encryptionService = inject(EncryptionService);
  sessionSuscription !: Subscription;
  encryptionSubscription !: Subscription;
  //Session variable

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private authService: MsalService,
    private broadcastService: MsalBroadcastService,
    private roleService: RoleService // Inject RoleService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)).
      subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.isStandAlonePage = navEnd.urlAfterRedirects === '/request-access'
      });
  }

  ngOnInit(): void {
    
    this.broadcastService.inProgress$
      .pipe(takeUntil(this.destroying$))
      .subscribe((status: InteractionStatus) => {
        if (status === InteractionStatus.None) {
          this.setActiveAccount();
        }
      });
  }

  clearAuthCache() {
    sessionStorage.clear();
  }

  setActiveAccount(): void {
    let activeAccount = this.authService.instance.getActiveAccount();

    //ESE-0326-2
    if (activeAccount?.username != null)
    this.loadUserID(activeAccount?.username);
    
    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      activeAccount = this.authService.instance.getAllAccounts()[0];
      this.authService.instance.setActiveAccount(activeAccount);
    }

    if (activeAccount) {
      this.isLoggedIn = true;
      this.userAccount = activeAccount.username.split('@')[0];
      this.userName = activeAccount.name || '';
      this.userRoles = activeAccount.idTokenClaims?.roles || [];
      
      // Set roles in RoleService
      this.roleService.setUserRoles(this.userRoles);
    } else {
      console.log('No active account found. User needs to log in.');
      this.authService.loginRedirect();
    }
  }

  hasSupportedRole(): boolean {
    // return this.roleService.hasSupportedRole();
    return true;
  }

  get hasViewAccess(): boolean {
    return this.roleService.hasViewAccess();
  }

  get showNoAccessMessage(): boolean {
    return this.userRoles.length > 0 && !this.hasViewAccess;
  }

  login(): void {
    this.authService.loginRedirect();
  }

  logout(): void {
    this.authService.logoutRedirect();
  }

  ngOnDestroy(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }

  title = 'keystone.client';

  //Load userID encrypted
  async loadUserID(currentAccount: string) {
    let sessionID = 0;
    this.sessionSuscription = await this.sessionService.getUserIDByUsername(currentAccount).subscribe({
      next: (response) => {

        sessionID = response;
        this.assignSessionID(sessionID);
      },
      error: (error) => {
        console.log('Error getting session ID', error);
      }
    });
    
  }

  async assignSessionID(sessionID: number) {
 
    const responseEncrypt = await this.encryptionService.encrypt(sessionID, environment.encryptionKey);

    this.sessionService.setCurrentBranch(responseEncrypt);

  }
}
