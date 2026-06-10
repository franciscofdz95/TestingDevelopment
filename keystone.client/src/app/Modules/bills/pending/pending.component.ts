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
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css',
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
export class PendingComponent implements OnInit, OnDestroy {
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
        if (event.mainTab === 'Bills' && event.subTab === 'Pending') {
          this.executecall(event.params);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  executecall(params: Paramlist): void {
    console.log('Execute call in Bills - Pending');
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
    { headerName: '', field: 'noname', hide: false, width: 110 },
    { headerName: 'View', field: 'view', width: 110 },
    { headerName: 'Edit / Scan', field: 'editscan', width: 110 },
    { headerName: 'Bill ID', field: 'billid', width: 110 },
    { headerName: 'Bill Ref Number', field: 'billrefnumber', width: 110 },
    { headerName: 'Charge Count', field: 'chargecount', width: 110 },
    { headerName: 'Location Code', field: 'locationcode', width: 110 },
    { headerName: 'Vendor Number', field: 'vendornumber', width: 110 },
    { headerName: 'Vendor / (Legal) Name', field: 'vendorname', width: 110 },
    { headerName: 'Modified Date EST (mm/dd/yyyy)', field: 'modifieddate', width: 110 },
    { headerName: 'Bill Total Amount (Local)', field: 'billtotalamt', width: 110 },
    { headerName: 'Bill Currency', field: 'billcurrency', width: 110 }
  ];

  exportData() {
    console.log('Exporting data from Pending');
  }
}
