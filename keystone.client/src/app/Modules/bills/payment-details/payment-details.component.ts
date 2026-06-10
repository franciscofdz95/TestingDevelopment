import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef, ColGroupDef } from 'ag-grid-community';
import { OptionsBarComponent } from '../options-bar/options-bar.component';
import { Subject, takeUntil } from 'rxjs';
import { Paramlist } from '../../../Models/Paramlist.model';
import { ExecuteService } from '../../../Service/execute.service';

@Component({
  standalone: true,
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrl: './payment-details.component.css',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    AgGridAngular,
    OptionsBarComponent,
  ]
})
export class PaymentDetailsComponent implements OnInit, OnDestroy {
  @Output() toggleModal = new EventEmitter<void>();
  private destroy$ = new Subject<void>();
  private gridApi!: GridApi;
  constructor(private executeService: ExecuteService) {

  }

  ngOnInit(): void {
    ////Filter subscription
    this.executeService.execute$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        //console.log('tabs: ', event);
        if (event.mainTab === 'Bills' && event.subTab === 'Payment Details') {
          this.executecall(event.params);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  executecall(params: Paramlist): void {
    console.log('Execute call in Bills - Payments');
    // Execute report logic here
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
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
    { headerName: 'Location Code', field: 'locationcode', width: 110 },
    { headerName: 'Bill Ref Number', field: 'billrefnumber', width: 110 },
    { headerName: 'Bill ID', field: 'billid', width: 110 },
    { headerName: 'Invoice Status', field: 'invoicestatus', width: 110 },
    { headerName: 'Supplier Name', field: 'suppliername', width: 110 },
    { headerName: 'Supplier Site', field: 'suppliersite', width: 110 },
    { headerName: 'Document Image ID', field: 'documentimgid', width: 110 },
    { headerName: 'Payment Status', field: 'paymentstatus', width: 110 },
    { headerName: 'Payment Date', field: 'paymentdate', width: 110 },
    { headerName: 'Amount Paid', field: 'amountpaid', width: 110 },
    { headerName: 'Payment Currency', field: 'paymentcurrency', width: 110 },
    { headerName: 'Payment Method', field: 'paymentmethod', width: 110 },
    { headerName: 'Document Number', field: 'documentnumber', width: 110 },
    { headerName: 'Scheduled Date', field: 'scheduleddate', width: 110 }
  ];

  exportData() {
    console.log('Exporting data from Payment');
  }
}
