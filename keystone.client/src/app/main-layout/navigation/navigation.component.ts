import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, OnDestroy, ComponentRef } from '@angular/core';
import { RoleService } from '../../Service/role.service';
import { FilterService, FilterOption } from '../../Service/filter.service';
import { Subject, takeUntil, distinctUntilChanged, debounceTime, switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Paramlist } from '../../Models/Paramlist.model';
import { ExecuteService } from '../../Service/execute.service';
import { LocalShipmentComponent } from '../../Modules/local-shipment/local-shipment.component';
import { LocalShipmentFilter } from '../../Modules/local-shipment/Service/local-shipment.service';

interface ViewInfo {
  type: 'tab' | 'subtab';
  mainTab: string;
  mainView: string;
  subTab?: string;
  component: string;
  breadcrumb: string;
}


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent implements AfterViewInit, OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Track user roles and access state
  userRoles: string[] = [];
  accessibleTabs: string[] = [];
  noAccessMessage: string = '';

  private suppressNextShownEvent = false;
  private cameFromEmailDeepLink = false;

  // Track the first accessible tab
  firstAccessibleTab: string | null = null;

  isModalActive: boolean = false;
  errorMessage: string | null = null;
  selectedDate: Date | null = null;

  // Variables for views control
  private enableViewTracking: boolean = true;
  private lastViewSignature: string | null = null;
  private trackingTimeout: any = null;

  
  activeTab: string = '';

  //parameters list

  paramsList: Paramlist = {
      //Main parameters
      accountingyearval: 0,
      accountingmonthval: 0,
      displaycurrentval: '',
      locationtypeval: '',
      inputadvval: '',
      origdestval: '',
      invoicestatval: '',
      accrualstatval: '',
      costtypeval: '',
      scandestval: '',
      paidstatusval: '',
      vendorcodeval: '',
      //Advanced filters
      countryval: '',
      companycodeval: '',
      locationcodeval: '',
      originval: '',
      destinationval: '',
      batchidval: '',
      startdateval: new Date(),
      mblcostbasisval: '',
      mblnumberval: '',
      containernumberval: '',
      shipmentnumval: '',
      carrierbolval: '',
      chargecodeval: '',
      billstatusval: '',
      enddateval: new Date(),
      paidstatusadvval: '',
      servicecodeval: '',
      chargestatusval: '',
      costtypeadvval: '',
      vendorcodeadvval: '',
      invoicerefnoval: '',
      origdestadvval: '',
      receiveddateval: new Date(),
      e2kcarrierval: '',
      //Paid Differently
      paiddifferentlyval: '',
      loccountrypaidval: '',
      locationregval: '',
      shipmentOrigval: '',
      shipmentDestval: '',
      reasonval: '',
      serviceval: '',
      vendorNameval: '',
      masterbillval: ''
  };


  //#region Filters Catalog Flags
  accountingyeardis: boolean = false;
  //accountingyearhid: boolean = false;
  accountingmonthdis: boolean = false;
  //accountingmonthhid: boolean = false;
  displaycurrentdis: boolean = false;
  displaycurrenthid: boolean = true;
  locationtypedis: boolean = false;
  locationtypehid: boolean = true;
  inputadvdis: boolean = false;
  inputadvhid: boolean = true;
  origdestdis: boolean = false;
  origdesthid: boolean = true;
  invoicestatdis: boolean = false;
  invoicestathid: boolean = true;
  accrualstatdis: boolean = false;
  accrualtstathid: boolean = true;
  costtypedis: boolean = false;
  costtypehid: boolean = true;
  scandestdis: boolean = false;
  scandesthid: boolean = true;
  paidstatusdis: boolean = false;
  paidstatushid: boolean = true;
  vendorcodedis: boolean = false;
  vendorcodehid: boolean = true;
  //Advanced filters
  countrydis: boolean = false;
  countryhid: boolean = false;
  companycodedis: boolean = false;
  companycodehid: boolean = false;
  locationcodedis: boolean = false;
  locationcodehid: boolean = false;
  origindis: boolean = false;
  originhid: boolean = false;
  destinationdis: boolean = false;
  destinationhid: boolean = false;
  batchiddis: boolean = false;
  batchidhid: boolean = false;
  startdatedis: boolean = false;
  startdatehid: boolean = false;
  mblcostbasisdis: boolean = false;
  mblcostbasishid: boolean = false;
  mblnumberdis: boolean = false;
  mblnumberhid: boolean = false;
  containernumberdis: boolean = false;
  containernumberhid: boolean = false;
  shipmentnumdis: boolean = false;
  shipmentnumhid: boolean = false;
  carrierboldis: boolean = false;
  carrierbolhid: boolean = false;
  chargecodedis: boolean = false;
  chargecodehid: boolean = false;
  billstatusdis: boolean = false;
  billstatushid: boolean = false;
  enddatedis: boolean = false;
  enddatehid: boolean = false;
  paidstatusadvdis: boolean = false;
  paidstatusadvhid: boolean = false;
  servicecodedis: boolean = false;
  servicecodehid: boolean = false;
  chargestatusdis: boolean = false;
  chargestatushid: boolean = false;
  costtypeadvdis: boolean = false;
  costtypeadvhid: boolean = false;
  vendorcodeadvdis: boolean = false;
  vendorcodeadvhid: boolean = false;
  invoicerefnodis: boolean = false;
  invoicerefnohid: boolean = false;
  origdestadvdis: boolean = false;
  origdestadvhid: boolean = false;
  receiveddatedis: boolean = false;
  receiveddatehid: boolean = false;
  e2kcarrierdis: boolean = false;
  e2kcarrierhid: boolean = false;
  //Paid Differently
  paiddifferentlyhid: boolean = false;
  //#endregion Filters Catalog Flags

  // subtabs
  private readonly TABS_WITH_SUBVIEWS = new Set(['Bills', 'Accruals']);

  @ViewChild('tabWrapper', { static: false }) tabWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('tabList', { static: false }) tabList!: ElementRef<HTMLUListElement>;
  @ViewChild('mainTabContent', { static: false }) mainTabContent!: ElementRef<HTMLDivElement>;
  @ViewChild(LocalShipmentComponent) localShipmentComponent!: LocalShipmentComponent;

  // Filter model values for local shipment
  filterAcctYear: string = '';
  filterAcctMonth: string = '';
  filterDisplayCurr: string = '';
  filterLocType: string = 'DEP';
  filterLocCode: string = '';
  filterOrigDest: string = '';
  filterServiceCode: string = '';
  filterChargeStatus: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  // Filter dropdown data arrays
  accountingYearOptions: FilterOption[] = [];
  accountingMonthOptions: FilterOption[] = [];
  accountingMonthFilteredOptions: FilterOption[] = [];
  displayCurrencyOptions: FilterOption[] = [];
  locationTypeOptions: { value: string; text: string }[] = [
    { value: 'DEP', text: 'DEP' },
    { value: 'TP', text: 'TP' }
  ];
  locationCodeOptions: FilterOption[] = [];
  locationCodeTypeahead$ = new Subject<string>();
  locationCodeLoading = false;

  hasHorizontalScroll = false;
  private resizeTimeout: any;
  isCollapsed = false;
  executeService:any
  private filterService: FilterService;
  constructor(private roleService: RoleService, private fb: FormBuilder, private _executeService: ExecuteService, _filterService: FilterService) {
    this.executeService = _executeService;
    this.filterService = _filterService;
  }

  ngOnInit(): void {

    const url = new URL(window.location.href);
    this.cameFromEmailDeepLink = url.searchParams.has('tab');

    // Load filter dropdown data with defaults (matching old ExtJS behavior)
    this.loadFilterDefaults();

    // Subscribe to role changes
    this.roleService.userRoles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(roles => {
        this.userRoles = roles;
       // this.accessibleTabs = this.roleService.getAccessibleTabs();
        this.noAccessMessage = this.roleService.getNoAccessMessage();

        // Set the first accessible tab
        this.setFirstAccessibleTab();

        this.activateTabFromUrlOrDefault();
      });
    //Activate filters for home
    this.homeFilters();
  }

  /**
   * Load all filter dropdown options and set default values.
   * Matches old ExtJS defaults:
   *   - AcctYear: current year (e.g., 2026)
   *   - AcctMonth: "All"
   *   - DisplayCurr: "USD"
   *   - LocType: "DEP"
   *   - LocCode: (empty, user types min 3 chars)
   */
  private loadFilterDefaults(): void {
    const currentYear = new Date().getFullYear().toString();

    // Load Accounting Years
    this.filterService.getAccountingYears()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: FilterOption[]) => {
          this.accountingYearOptions = data;
          // Default to current year (old ExtJS: year = new Date().getFullYear())
          this.filterAcctYear = currentYear;
        },
        error: (err: any) => {
          console.error('Error loading accounting years:', err);
          // Fallback: generate a reasonable list
          const years = [];
          for (let y = new Date().getFullYear(); y >= 2015; y--) {
            years.push({ Accounting_Year: y.toString() });
          }
          this.accountingYearOptions = years;
          this.filterAcctYear = currentYear;
        }
      });

    // Load Accounting Months
    this.filterService.getAccountingMonths()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: FilterOption[]) => {
          this.accountingMonthOptions = data;
          this.accountingMonthFilteredOptions = data;
          // Default to "All" (old ExtJS: value = new Date().getMonth() + 1, but screenshot shows "All")
          this.filterAcctMonth = 'All';
        },
        error: (err: any) => {
          console.error('Error loading accounting months:', err);
          // Fallback
          const months: FilterOption[] = [{ Accounting_Month: 'All', Accounting_Year: '' }];
          for (let m = 1; m <= 12; m++) {
            months.push({ Accounting_Month: m.toString(), Accounting_Year: '' });
          }
          this.accountingMonthOptions = months;
          this.accountingMonthFilteredOptions = months;
          this.filterAcctMonth = 'All';
        }
      });

    // Load Display Currencies
    this.filterService.getDisplayCurrencies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: FilterOption[]) => {
          this.displayCurrencyOptions = data;
          // Default to "USD" (old ExtJS: value = 'USD')
          this.filterDisplayCurr = 'USD';
        },
        error: (err: any) => {
          console.error('Error loading display currencies:', err);
          // Fallback
          this.displayCurrencyOptions = [
            { currency_code: 'USD' },
            { currency_code: 'EUR' },
            { currency_code: 'CNY' }
          ];
          this.filterDisplayCurr = 'USD';
        }
      });

    // Location Type: static (old ExtJS: value = 'DEP')
    this.filterLocType = 'DEP';

    // Location Code typeahead (autocomplete after 3 chars, matching old ExtJS minChars: 3)
    this.locationCodeTypeahead$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      debounceTime(300),
      switchMap((term: string) => {
        if (!term || term.length < 3) {
          return of([]);
        }
        this.locationCodeLoading = true;
        return this.filterService.getLocationCodes('', '', term);
      })
    ).subscribe({
      next: (data: FilterOption[]) => {
        this.locationCodeOptions = data;
        this.locationCodeLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading location codes:', err);
        this.locationCodeLoading = false;
      }
    });
  }

  /**
   * When the accounting year changes, filter the month dropdown
   * to show only months for that year (matching old ExtJS behavior).
   */
  onAcctYearChange(value: string): void {
    this.filterAcctYear = value;
    if (this.accountingMonthOptions && this.accountingMonthOptions.length > 0) {
      this.accountingMonthFilteredOptions = this.accountingMonthOptions.filter(
        (m: any) => m.Accounting_Year === value || m.Accounting_Month === 'All'
      );
    }
  }

  /**
   * When location code search text changes (min 3 chars), load matching locations.
   */
  onLocationCodeSearch(event: { term: string; items: any[] }): void {
    if (event.term && event.term.length >= 3) {
      this.filterService.getLocationCodes('', '', event.term)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: FilterOption[]) => {
            this.locationCodeOptions = data;
          },
          error: (err: any) => {
            console.error('Error loading location codes:', err);
          }
        });
    }
  }

  ngAfterViewInit(): void {
    this.checkScroll();

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.checkScroll(), 150);
    });

    this.bindClearParamsOnUserTabChange();

    // Initialize tracking
    this.initializeViewTracking();

    // Inittial log
    setTimeout(() => {
      this.trackCurrentView();
    }, 500);
  }

  ngOnDestroy(): void {
    // Clear timeouts
    if (this.trackingTimeout) {
      clearTimeout(this.trackingTimeout);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  // Check tab tracking
  private initializeViewTracking(): void {
    
    this.setupMainTabTracking();

    this.setupSubTabTracking();

  }

  private setupMainTabTracking(): void {
    const mainTabsContainer = document.querySelector('#mainTabs');
    
    if (!mainTabsContainer) return;

    // Event delegation: 1 listener 1 container
    mainTabsContainer.addEventListener('shown.bs.tab', (event: Event) => {
      if (!this.enableViewTracking) return;

      // Avoid multiple executions
      this.debouncedTrackView();
    });

  }

  private setupSubTabTracking(): void {
    const mainTabContent = document.querySelector('#mainTabContent');
    
    if (!mainTabContent) return;

    mainTabContent.addEventListener('click', (event: Event) => {
      if (!this.enableViewTracking) return;

      const target = event.target as HTMLElement;
      
      const navLink = target.closest('a.nav-link');
      
      if (navLink && this.isInSubTabContainer(navLink as HTMLElement)) {

        this.debouncedTrackView();
      }
    });

  }

  private isInSubTabContainer(element: HTMLElement): boolean {
    const navTabs = element.closest('.nav-tabs');
    return navTabs !== null && navTabs.id !== 'mainTabs';
  }

  private debouncedTrackView(): void {
    if (this.trackingTimeout) {
      clearTimeout(this.trackingTimeout);
    }

    this.trackingTimeout = setTimeout(() => {
      this.trackCurrentView();
    }, 150); 
  }

  private trackCurrentView(): void {
    if (!this.enableViewTracking) return;

    requestAnimationFrame(() => {
      const viewInfo = this.getCurrentViewInfo();
      
      if (!viewInfo) return;

      const signature = `${viewInfo.mainTab}:${viewInfo.component}`;
      if (this.lastViewSignature === signature) {
        return; 
      }

      this.lastViewSignature = signature;

      this.logViewInfo(viewInfo);
    });
  }

  private getCurrentViewInfo(): ViewInfo | null {
   
    const mainTab = document.querySelector('#mainTabs .nav-link.active') as HTMLElement;
    const mainPane = document.querySelector('#mainTabContent > .tab-pane.active') as HTMLElement;

    if (!mainTab || !mainPane) return null;

    const mainTabName = mainTab.textContent?.trim() || 'Unknown';
    const mainViewId = mainPane.id || 'Unknown';

    if (this.TABS_WITH_SUBVIEWS.has(mainTabName)) {
      const subViewInfo = this.getSubViewInfo(mainPane);
      
      if (subViewInfo) {
        return {
          type: 'subtab',
          mainTab: mainTabName,
          mainView: mainViewId,
          subTab: subViewInfo.name,
          component: subViewInfo.component,
          breadcrumb: `${mainTabName} → ${subViewInfo.name}`
        };
      }
    }

    // Tab without subtabs
    return {
      type: 'tab',
      mainTab: mainTabName,
      mainView: mainViewId,
      component: mainViewId,
      breadcrumb: mainTabName
    };
  }

  // Get subviews to get the active
  private getSubViewInfo(pane: HTMLElement): { name: string; component: string } | null {
    
    const activeNavLink = pane.querySelector('.nav-tabs .nav-link.active') as HTMLElement;
    if (activeNavLink) {
      const name = activeNavLink.textContent?.trim() || 'Unknown';
      
      const visibleComponent = pane.querySelector('[style*="display: block"]') as HTMLElement;
      const component = visibleComponent?.tagName.toLowerCase() || 'unknown';
      
      return { name, component };
    }

    const visibleElement = pane.querySelector('[style*="display: block"]') as HTMLElement;
    if (visibleElement) {
      const component = visibleElement.tagName.toLowerCase();
      const name = this.getDisplayNameFromTag(component);
      
      return { name, component };
    }

    return null;
  }

  private readonly tagNameCache = new Map<string, string>([
    ['app-logged', 'Logged'],
    ['app-pending', 'Pending'],
    ['app-verified', 'Verified'],
    ['app-approved', 'Approved'],
    ['app-printed', 'Printed'],
    ['app-scanned', 'Scanned'],
    ['app-queued', 'Queued'],
    ['app-sent', 'Sent'],
    ['app-archived', 'Archived'],
    ['app-payment-details', 'Payment Details']
  ]);

  private getDisplayNameFromTag(tagName: string): string {
    return this.tagNameCache.get(tagName) || tagName;
  }

  private logViewInfo(info: ViewInfo): void {
    //console.log(`📍 ${info.breadcrumb} | ${info.component} | ${new Date().toLocaleTimeString()}`);
    this.activeTab = info.component;
    this.activeMenus(this.activeTab);
  }

  // Toggle to activate or deactivate tracking
  public toggleViewTracking(enabled?: boolean): void {
    this.enableViewTracking = enabled !== undefined ? enabled : !this.enableViewTracking;
  }

  // Reset log
  public resetViewTracking(): void {
    this.lastViewSignature = null;
  }

  // Get current view
  public getCurrentView(): ViewInfo | null {
    return this.getCurrentViewInfo();
  }

  // Method to determine the first accessible tab based on display order
  private setFirstAccessibleTab(): void {
    // Define the tab order as they appear in the UI
    const tabOrder = [
      'Home',
      'Local Shipment',
      'Location OCEAN MBL',
      'Bills',
      'Location Vendor',
      'Vendor Shipment',
      'Vendors',
      'Accruals',
      'Vendor Statement Summary',
      'Invoice Processing',
      'Paid Differently',
      //ESE-1025-1,2
      'Reports',
      'Sys Admin Modules'
    ];

    this.firstAccessibleTab = 'Home';

  }

  /**
   * Check if user has access to a specific tab using centralized configuration
   */
  hasTabAccess(tabName: string): boolean {
    //return this.roleService.hasTabAccess(tabName);
    return true;
  }

  // Get the ID of the first accessible tab for UI activation
  getFirstAccessibleTabId(): string | null {
    if (!this.firstAccessibleTab) return null;

    const tabIdMap: { [key: string]: string } = {
      'Home': 'home-tab',
      'Local Shipment': 'local-shipment-tab',
      'Bills': 'bills-tab',
      'Location Vendor': 'location-vendor-tab',
      'Vendor Shipment': 'vendor-shipment-tab',
      'Vendors': 'vendors-tab',
      'Accruals': 'accruals-tab',
      'Vendor Statement Summary': 'vendor-statement-tab',
      'Invoice Processing': 'invoice-processing-tab',
      'Paid Differently': 'paid-differently-tab',
      //ESE-1025-1,2
      'Reports': 'sys-app-admin-modules-tab',
      'Sys Admin Modules': 'sys-app-admin-modules-tab'
    };

    return tabIdMap[this.firstAccessibleTab] || null;
  }

  // Get the pane ID of the first accessible tab
  getFirstAccessibleTabPaneId(): string | null {
    if (!this.firstAccessibleTab) return null;

    const tabPaneMap: { [key: string]: string } = {
      'Home': 'home-pane',
      'Local Shipment': 'local-shipment-pane',
      'Bills': 'bills-pane',
      'Location Vendor': 'location-vendor-pane',
      'Vendor Shipment': 'vendor-shipment-pane',
      'Vendors': 'vendors-pane',
      'Accruals': 'accruals-pane',
      'Vendor Statement Summary': 'vendor-statement-pane',
      'Invoice Processing': 'invoice-processing-pane',
      'Paid Differently': 'paid-differently-pane',
      //ESE-1025-1,2
      'Reports': 'sys-app-admin-modules-pane',
      'Sys Admin Modules': 'sys-app-admin-modules-pane'
    };

    return tabPaneMap[this.firstAccessibleTab] || null;
  }

  get hasViewAccess(): boolean {
    //return this.roleService.hasViewAccess();
    return true;
  }

  get showNoAccessMessage(): boolean {
    return this.roleService.shouldShowNoAccessMessage();
  }

  /**
   * Get formatted list of user's current roles
   */
  get formattedUserRoles(): string {
    return this.userRoles.join(', ');
  }

  /**
   * Get count of accessible tabs
   */
  get accessibleTabCount(): number {
    return this.accessibleTabs.length;
  }

  private checkScroll() {
    if (!this.tabList?.nativeElement || !this.tabWrapper?.nativeElement || !this.mainTabContent?.nativeElement) {
      return;
    }

    const listEl = this.tabList.nativeElement;
    const wrapperEl = this.tabWrapper.nativeElement;
    const mainTabContent = this.mainTabContent.nativeElement;

    const hasScroll = listEl.scrollWidth > listEl.clientWidth;
    this.hasHorizontalScroll = hasScroll;

    listEl.classList.toggle('has-scroll', hasScroll);
    wrapperEl.classList.toggle('has-scroll', hasScroll);
    mainTabContent.classList.toggle('has-scroll', hasScroll);
  }

  private activateTabFromUrlOrDefault(): void {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');


    if (!tab) return;

    const tabIdByParam: Record<string, { tabName: string; tabId: string }> = {
      'Home': { tabName: 'Home', tabId: 'home-tab' },
    };

    const target = tabIdByParam[tab];
    if (!target) return;
    if (!this.hasTabAccess(target.tabName)) return;

    this.suppressNextShownEvent = true;

    setTimeout(() => {
      const el = document.getElementById(target.tabId) as HTMLElement | null;
      el?.click();
    }, 0);
  }

  private bindClearParamsOnUserTabChange() {
    const tabs = document.querySelectorAll('#mainTabs a[data-bs-toggle="tab"]');

    tabs.forEach(tab => {
      tab.addEventListener('shown.bs.tab', () => {
        if (!this.cameFromEmailDeepLink) return;

        if (this.suppressNextShownEvent) {
          this.suppressNextShownEvent = false;
          return;
        }

        const url = new URL(window.location.href);
        if (url.search) {
          url.search = '';
          history.replaceState(null, '', url.toString());
        }

        this.cameFromEmailDeepLink = false;
      });
    });
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }
  //OnChange Events
  onChangeServiceCode(value: any): void {
  }

  onChangeChargeStatus(value: any): void {
  }

  onChangeCostType(value: any): void {
  }

  onChangeBillStatus(value: any): void {
  }

  onChangeDestination(value: any): void {
  }

  onChangePaidStatus(value: any): void {
  }

  closeForm(): void {
    this.isModalActive = false;
  }

  activeFilter(event: any) {
    this.isModalActive = true;
  }

  onGoClick(): void {
    // Determine current active pane: use tracked activeTab, or fall back to DOM query
    let activePane = this.activeTab;
    if (!activePane) {
      const activePaneEl = document.querySelector('#mainTabContent > .tab-pane.active') as HTMLElement;
      activePane = activePaneEl?.id || '';
    }
    console.log('Go clicked - activePane:', activePane);
    
    switch (activePane) {
      case 'local-shipment-pane':
        this.loadLocalShipment();
        break;
      default:
        console.log('Go clicked for unhandled pane:', activePane);
        break;
    }
  }

  private loadLocalShipment(): void {
    console.log('loadLocalShipment called');

    const filters: LocalShipmentFilter = {
      acctYear: this.filterAcctYear || new Date().getFullYear().toString(),
      acctMonth: this.filterAcctMonth || 'All',
      displayCurr: this.filterDisplayCurr || 'USD',
      loctype: this.filterLocType || 'DEP',
      locCode: this.filterLocCode || undefined,
      origDest: this.filterOrigDest || undefined,
      serviceCode: this.filterServiceCode || undefined,
      chargeStatus: this.filterChargeStatus || undefined,
      startDate: this.filterStartDate || undefined,
      endDate: this.filterEndDate || undefined,
    };

    // Use setTimeout to ensure ViewChild is resolved after view renders
    setTimeout(() => {
      console.log('localShipmentComponent available:', !!this.localShipmentComponent);
      if (this.localShipmentComponent) {
        this.localShipmentComponent.loadData(filters);
      } else {
        console.error('LocalShipmentComponent ViewChild is not available!');
      }
    }, 100);
  }


  onDateChange() {
    console.log('Date:', this.selectedDate);
  }

  private activeMenus(componentName: string): void {
    switch (componentName) {
      case 'home-pane':
        this.cleanFilters();
        this.homeFilters();
        break;
      case 'local-shipment-pane':
        this.cleanFilters();
        this.localShipmentFilters();
        this.loadLocalShipment();
        break;
      case 'location-oceanmbl-pane':
        this.cleanFilters();
        this.locationOceanMBLFilters();
        break;
      case 'location-vendor-pane':
        this.cleanFilters();
        this.locationVendorFilters();
        break;
      //bills
      case 'app-logged':
        this.cleanFilters();
        this.billsLoggedFilters();
        break;
      case 'app-pending':
        this.cleanFilters();
        this.billsPendingFilters();
        break;
      case 'app-verified':
        this.cleanFilters();
        this.billsVerifiedFilters();
        break;
      case 'app-approved':
        this.cleanFilters();
        this.billsApprovedFilters();
        break;
      case 'app-printed':
        this.cleanFilters();
        this.billsPrintedFilters();
        break;
      case 'app-scanned':
        this.cleanFilters();
        this.billsScannedFilters();
        break;
      case 'app-queued':
        this.cleanFilters();
        this.billsQueuedFilters();
        break;
      case 'app-sent':
        this.cleanFilters();
        this.billsSentFilters();
        break;
      case 'app-archived':
        this.cleanFilters();
        this.billsArchivedFilters();
        break;
      case 'app-payment-details':
        this.cleanFilters();
        this.billsPaymentDetailsFilters();
        break;
      case 'app-accrual-accuracy-rep':
        this.cleanFilters();
        this.accrualAccuracyRepFilter();
        break;
      case 'app-accrual-monthly-det':
        this.cleanFilters();
        this.accrualMonthlyDetailDetFilter();
        break;
      case 'vendors-pane':
        this.cleanFilters();
        this.vendorsFilter();
        break;
      case 'paid-differently-pane':
        this.cleanFilters();
        this.paidDifferentlyFilter();
        break;
      case 'vendors-shipment-pane':
        this.cleanFilters();
        this.vendorShipmentFilters();
        break;
      default:
        this.cleanFilters();
        break;
    }

  }

  //#region Controllers
  private cleanFilters(): void {
    this.accountingyeardis= true;
    this.accountingmonthdis= true;
    this.displaycurrentdis= true;
    this.displaycurrenthid= true;
    this.locationtypedis= true;
    this.locationtypehid= true;
    this.origdestdis = true;
    this.origdesthid = true;
    this.invoicestatdis = true;
    this.invoicestathid = true;
    this.accrualstatdis = true;
    this.accrualtstathid = true;
    this.costtypedis = true;
    this.costtypehid = true;
    this.scandestdis = true;
    this.scandesthid = true;
    this.paidstatusdis = true;
    this.paidstatushid = true;
    this.vendorcodedis = true;
    this.vendorcodehid = true;
    //Advanced filters
    this.countrydis= false;
    this.companycodedis= false;
    this.locationcodedis= false;
    this.origindis= false;
    this.destinationdis= false;
    this.batchiddis= false;
    this.startdatedis= false;
    this.mblcostbasisdis= false;
    this.mblnumberdis= false;
    this.containernumberdis= false;
    this.shipmentnumdis= false;
    this.carrierboldis= false;
    this.chargecodedis= false;
    this.billstatusdis= false;
    this.enddatedis= false;
    this.paidstatusadvdis= false;
    this.servicecodedis= false;
    this.chargestatusdis= false;
    this.costtypeadvdis= false;
    this.vendorcodeadvdis= false;
    this.invoicerefnodis= false;
    this.origdestadvdis= false;
    this. receiveddatedis= false;
    this.e2kcarrierdis= false;

    this.paiddifferentlyhid = true;
  }
  
  private homeFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;
    this.displaycurrentdis = false;
    this.locationtypedis = false;

    //Advanced filters
    this.countrydis = false;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = false;
    this.destinationdis = false;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = false;
    this.mblnumberdis = false;
    this.containernumberdis = false;
    this.shipmentnumdis = false;
    this.carrierboldis = false;
    this.chargecodedis = false;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = false;
    this.servicecodedis = false;
    this.chargestatusdis = false;
    this.costtypeadvdis = false;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = false;
    this.receiveddatedis = false;
    this.e2kcarrierdis = false;
  }

  private localShipmentFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;
    this.displaycurrentdis = false;
    this.locationtypedis = false;

    //Advanced filters
    this.countrydis = false;
    this.companycodedis = true;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = true;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = false;
    this.containernumberdis = false;
    this.shipmentnumdis = false;
    this.carrierboldis = false;
    this.chargecodedis = true;
    this.billstatusdis = true;
    this.enddatedis = false;
    this.paidstatusadvdis = false;
    this.servicecodedis = false;
    this.chargestatusdis = false;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = true;
    this.invoicerefnodis = true;
    this.origdestadvdis = true;
    this.receiveddatedis = false;
    this.e2kcarrierdis = true;
  }

  private locationOceanMBLFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;
    this.displaycurrentdis = false;
    this.locationtypedis = false;
    this.origdestdis = false;
    this.origdesthid = false;

    //Advanced filters
    this.countrydis = false;
    this.companycodedis = true;
    this.locationcodedis = false;
    this.origindis = false;
    this.destinationdis = false;
    this.batchiddis = true;
    this.startdatedis = false;
    this.mblcostbasisdis = false;
    this.mblnumberdis = false;
    this.containernumberdis = false;
    this.shipmentnumdis = false;
    this.carrierboldis = false;
    this.chargecodedis = true;
    this.billstatusdis = true;
    this.enddatedis = false;
    this.paidstatusadvdis = false;
    this.servicecodedis = true;
    this.chargestatusdis = false;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = true;
    this.invoicerefnodis = true;
    this.origdestadvdis = false;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private locationVendorFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;
    this.displaycurrentdis = true;
    this.locationtypedis = true;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = true;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = true;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = true;
    this.enddatedis = false;
    this.paidstatusadvdis = false;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = true;
    this.invoicerefnodis = true;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private vendorShipmentFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;
    this.displaycurrentdis = false;
    this.locationtypedis = false;
    this.accrualstatdis = false;
    this.accrualtstathid = false;
    this.costtypedis = false;
    this.costtypehid = false;

    //Advanced filters
    this.countrydis = false;
    this.companycodedis = true;
    this.locationcodedis = false;
    this.origindis = false;
    this.destinationdis = false;
    this.batchiddis = true;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = false;
    this.containernumberdis = false;
    this.shipmentnumdis = false;
    this.carrierboldis = false;
    this.chargecodedis = false;
    this.billstatusdis = true;
    this.enddatedis = false;
    this.paidstatusadvdis = false;
    this.servicecodedis = false;
    this.chargestatusdis = true;
    this.costtypeadvdis = false;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = true;
    this.origdestadvdis = true;
    this.receiveddatedis = false;
    this.e2kcarrierdis = true;
  }

  private vendorsFilter(): void {
    this.accountingyeardis = true;
    this.accountingmonthdis = true;
    this.displaycurrentdis = true;
    this.locationtypedis = true;

    //Advanced filters
    this.countrydis = false;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = true;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = true;
    this.enddatedis = true;
    this.paidstatusadvdis = false;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = true;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private paidDifferentlyFilter(): void {
    this.paiddifferentlyhid = false;
  }

  private accrualAccuracyRepFilter(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;
    this.displaycurrentdis = true;
    this.locationtypedis = true;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = true;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = true;
    this.startdatedis = true;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = true;
    this.enddatedis = true;
    this.paidstatusadvdis = false;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = true;
    this.invoicerefnodis = true;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private accrualMonthlyDetailDetFilter(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;
    this.displaycurrentdis = true;
    this.locationtypedis = true;

    //Advanced filters
    this.countrydis = false;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = true;
    this.startdatedis = true;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = false;
    this.carrierboldis = true;
    this.chargecodedis = false;
    this.billstatusdis = true;
    this.enddatedis = true;
    this.paidstatusadvdis = false;
    this.servicecodedis = false;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = true;
    this.invoicerefnodis = true;
    this.origdestadvdis = true;
    this.receiveddatedis = false;
    this.e2kcarrierdis = true;
  }

  private billsLoggedFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsPendingFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsVerifiedFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsApprovedFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsPrintedFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsScannedFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;
    this.scandestdis = false;
    this.scandesthid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsQueuedFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;
    this.scandestdis = false;
    this.scandesthid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsSentFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsArchivedFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = false;
    this.startdatedis = false;
    this.mblcostbasisdis = true;
    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = true;
    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }

  private billsPaymentDetailsFilters(): void {
    this.accountingyeardis = false;
    this.accountingmonthdis = false;

    this.invoicestatdis = false;
    this.invoicestathid = false;
    this.paidstatusdis = false;
    this.paidstatushid = false;

    //Advanced filters
    this.countrydis = true;
    this.companycodedis = false;
    this.locationcodedis = false;
    this.origindis = true;
    this.destinationdis = true;
    this.batchiddis = true;
    this.startdatedis = false;
    this.mblcostbasisdis = true;

    this.mblnumberdis = true;
    this.containernumberdis = true;
    this.shipmentnumdis = true;
    this.carrierboldis = true;
    this.chargecodedis = true;
    this.billstatusdis = false;
    this.enddatedis = false;
    this.paidstatusadvdis = false;

    this.servicecodedis = true;
    this.chargestatusdis = true;
    this.costtypeadvdis = true;
    this.vendorcodeadvdis = false;
    this.invoicerefnodis = false;
    this.origdestadvdis = true;
    this.receiveddatedis = true;
    this.e2kcarrierdis = true;
  }
  //#endregion

  async executeTab(): Promise<void> {
 
    // Sync the 5 filter criteria values into paramsList before triggering
    this.paramsList.accountingyearval = this.filterAcctYear ? Number(this.filterAcctYear) : new Date().getFullYear();
    this.paramsList.accountingmonthval = this.filterAcctMonth === 'All' ? 0 : Number(this.filterAcctMonth);
    this.paramsList.displaycurrentval = this.filterDisplayCurr || 'USD';
    this.paramsList.locationtypeval = this.filterLocType || 'DEP';
    this.paramsList.locationcodeval = this.filterLocCode || '';

    // Verify if is active
    const activeTab = this.getCurrentViewInfo();

    if (activeTab?.type === 'subtab' && activeTab.subTab) {
      this.executeService.triggerExecute(
        activeTab.mainTab,  
        this.paramsList,
        activeTab.subTab     
      );
    } else {
      this.executeService.triggerExecute(
        activeTab?.mainTab,
        this.paramsList
      );
    }
  }
}
