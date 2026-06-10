import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoggedComponent } from './logged/logged.component';
import { PendingComponent } from './pending/pending.component';
import { VerifiedComponent } from './verified/verified.component';
import { ApprovedComponent } from './approved/approved.component';
import { PrintedComponent } from './printed/printed.component';
import { ScannedComponent } from './scanned/scanned.component';
import { QueuedComponent } from './queued/queued.component';
import { SentComponent } from './sent/sent.component';
import { ArchivedComponent } from './archived/archived.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { OptionsBarComponent } from './options-bar/options-bar.component';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  standalone: true,
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css',
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    AgGridAngular,
    NgSelectModule,
    MatCheckboxModule,
    LoggedComponent,
    PendingComponent,
    VerifiedComponent,
    ApprovedComponent,
    PrintedComponent,
    ScannedComponent,
    QueuedComponent,
    SentComponent,
    ArchivedComponent,
    PaymentDetailsComponent,
  ]
})
export class BillsComponent implements OnInit{
  activeTab: string = 'logged'; // Default active tab
  showModal = false;
  errorMessage: string = '';
  private gridApi!: GridApi;
  selectedDate: Date | null = null;
  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }


  isModalOpen = false;
  isModalOpen2 = false;

  toggleModal() {
    console.log('toggle modified', this.isModalOpen);
    this.isModalOpen = !this.isModalOpen;
    console.log('toggle modified', this.isModalOpen);
  }

  public overlayLoadingTemplate = `
    <span class="ag-overlay-loading-center">
      <i class="fa fa-spinner fa-spin fa-2x"></i>
      <br/>Query in progress, please wait...
    </span>`;

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true
  };

  columnDefs: ColDef[] = [
    { headerName: '', field: 'noname', hide: false, width: 110 },
    { headerName: 'View', field: 'view', width: 110 },
    { headerName: 'Edit / Scan', field: 'editscan', width: 110 },
    { headerName: 'Bill ID', field: 'billid', width: 110 },
    { headerName: 'Bill Ref Number', field: 'billrefnumber', width: 110 },
    { headerName: 'Charge Count', field: 'chargecount', width: 110 },
    { headerName: 'Location Code', field: 'locationcode', width: 110 },
    { headerName: 'Vendor / (Legal) Name', field: 'vendorname', width: 110 },
    { headerName: 'Modified Date EST (mm/dd/yyyy)', field: 'modifieddate', width: 110 },
    { headerName: 'Modified User Id', field: 'modifieduserid', width: 110 },
    { headerName: 'Bill Total Amount (Local)', field: 'billtotalamt', width: 110 },
    { headerName: 'Bill Currency', field: 'billcurrency', width: 110 }
  ];

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  onDateChange() {
    console.log('Date:', this.selectedDate);
  }

}
