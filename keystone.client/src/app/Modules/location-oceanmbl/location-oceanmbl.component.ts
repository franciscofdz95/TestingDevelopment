import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef, ColGroupDef, ValueFormatterParams, RowClassParams } from 'ag-grid-community';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { Paramlist } from '../../Models/Paramlist.model';
import { ExecuteService } from '../../Service/execute.service';
import { LocationOceanMBLService, LocationOceanMBLFilter } from './Service/location-oceanmbl.service';

@Component({
  standalone: true,
  selector: 'app-location-oceanmbl',
  templateUrl: './location-oceanmbl.component.html',
  styleUrl: './location-oceanmbl.component.css',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    AgGridAngular,
    HttpClientModule
  ],
  providers: [LocationOceanMBLService]
})
export class LocationOceanmblComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;
  private destroy$ = new Subject<void>();

  rowData: any[] = [];
  isLoading: boolean = false;
  totalRows: number = 0;

  constructor(
    private locationOceanMBLService: LocationOceanMBLService,
    private executeService: ExecuteService
  ) { }

  ngOnInit(): void {
    this.executeService.execute$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event.mainTab === 'Location OCEAN MBL') {
          this.executecall(event.params);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  executecall(params: Paramlist): void {
    const filters: LocationOceanMBLFilter = {
      acctYear: params.accountingyearval ? params.accountingyearval.toString() : new Date().getFullYear().toString(),
      acctMonth: params.accountingmonthval === 0 ? 'All' : params.accountingmonthval.toString(),
      displayCurr: params.displaycurrentval?.toString() || 'USD',
      loctype: params.locationtypeval?.toString() || 'DEP',
      origDest: params.origdestval?.toString() || '',
      locCode: params.locationcodeval?.toString() || '',
      origin: params.originval?.toString() || '',
      destination: params.destinationval?.toString() || '',
      startDate: params.startdateval ? new Date(params.startdateval).toISOString() : '',
      endDate: params.enddateval ? new Date(params.enddateval).toISOString() : '',
      mblCostBasis: params.mblcostbasisval?.toString() || '',
      mblNumber: params.mblnumberval?.toString() || '',
      containerNumber: params.containernumberval?.toString() || '',
      shipmentNumber: params.shipmentnumval?.toString() || '',
      carrierBol: params.carrierbolval?.toString() || '',
      chargeStatus: params.chargestatusval?.toString() || '',
      origDestAdv: params.origdestadvval?.toString() || '',
      country: params.countryval?.toString() || ''
    };

    this.loadData(filters);
  }

  loadData(filters?: LocationOceanMBLFilter): void {
    this.isLoading = true;
    if (this.gridApi) {
      this.gridApi.showLoadingOverlay();
    }

    this.locationOceanMBLService.getLocationOceanMBLReport(filters || {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.rowData = data;
          this.totalRows = data.length;
          this.isLoading = false;
          if (this.gridApi) {
            this.gridApi.hideOverlay();
            if (data.length === 0) {
              this.gridApi.showNoRowsOverlay();
            }
            this.gridApi.setGridOption('pinnedBottomRowData', [this.calculateGrandTotal(data)]);
            setTimeout(() => this.gridApi.autoSizeAllColumns(), 100);
          }
        },
        error: (err) => {
          console.error('Error loading Location OCEAN MBL data:', err);
          this.isLoading = false;
          this.rowData = [];
          if (this.gridApi) {
            this.gridApi.showNoRowsOverlay();
          }
        }
      });
  }

  private calculateGrandTotal(data: any[]): any {
    const sumFields = [
      'shipment_count',
      'mansellAmt', 'manbuyAmt', 'mandiff',
      'localsellAmt', 'localbuyAmt', 'localdiff',
      'totaldiff'
    ];

    const totals: any = { mbl_departdate: 'Grand Total' };
    sumFields.forEach(field => {
      totals[field] = data.reduce((sum, row) => {
        const val = parseFloat(row[field]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    });
    return totals;
  }

  exportToExcel(): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        fileName: 'LocationOceanMBLReport.csv'
      });
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    if (this.rowData && this.rowData.length > 0) {
      setTimeout(() => this.gridApi.autoSizeAllColumns(), 100);
    }
  }

  dateFormatter(params: ValueFormatterParams): string {
    if (!params.value) return '';
    const date = new Date(params.value);
    if (isNaN(date.getTime())) return params.value;
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  numberFormatter(params: ValueFormatterParams): string {
    if (params.value == null || params.value === '') return '';
    const num = parseFloat(params.value);
    if (isNaN(num)) return params.value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getRowClass = (params: RowClassParams): string => {
    if (params.node.rowPinned === 'bottom') {
      return 'grand-total-row';
    }
    return '';
  };

  public overlayLoadingTemplate = `
    <span class="ag-overlay-loading-center">
      <i class="fa fa-spinner fa-spin fa-2x"></i>
      <br/>Query in progress, please wait...
    </span>`;

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    wrapText: false,
    autoHeight: false,
    minWidth: 60,
    cellStyle: { 'white-space': 'nowrap', 'overflow': 'visible', 'text-overflow': 'unset' }
  };

  columnDefs: (ColDef | ColGroupDef)[] = [
    { headerName: 'MBL Depart Date', field: 'mbl_departdate', valueFormatter: this.dateFormatter, width: 140 },
    { headerName: 'Location', field: 'location', width: 110 },
    { headerName: 'MBL Origin Port', field: 'mbl_originport', width: 130 },
    { headerName: 'MBL Destination Port', field: 'mbl_destinationport', width: 150 },
    { headerName: 'MBL Number', field: 'mblNumber', hide: true },
    { headerName: 'O/D', field: 'od', width: 70 },
    { headerName: 'I/U', field: 'iu', width: 70 },
    { headerName: 'O/A', field: 'oa', width: 70 },
    { headerName: 'Cost Basis Code', field: 'cost_basiscode', width: 120 },
    { headerName: 'Shipment Count', field: 'shipment_count', width: 120, cellStyle: { textAlign: 'right' } },
    {
      headerName: 'Manifested (USD)',
      children: [
        { headerName: 'Sell Amt', field: 'mansellAmt', width: 120, valueFormatter: this.numberFormatter, cellStyle: { textAlign: 'right' } },
        { headerName: 'Buy Amt', field: 'manbuyAmt', width: 120, valueFormatter: this.numberFormatter, cellStyle: { textAlign: 'right' } },
        { headerName: 'Diff', field: 'mandiff', width: 110, valueFormatter: this.numberFormatter, cellStyle: { textAlign: 'right' } },
      ]
    },
    {
      headerName: 'Local (USD)',
      children: [
        { headerName: 'Sell Amt', field: 'localsellAmt', width: 120, valueFormatter: this.numberFormatter, cellStyle: { textAlign: 'right' } },
        { headerName: 'Buy Amt', field: 'localbuyAmt', width: 120, valueFormatter: this.numberFormatter, cellStyle: { textAlign: 'right' } },
        { headerName: 'Diff', field: 'localdiff', width: 110, valueFormatter: this.numberFormatter, cellStyle: { textAlign: 'right' } },
      ]
    },
    { headerName: 'Total Diff Amt (USD)', field: 'totaldiff', width: 150, valueFormatter: this.numberFormatter, cellStyle: { textAlign: 'right' } },
  ];
}
