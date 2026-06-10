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
  selector: 'app-logged',
  templateUrl: './logged.component.html',
  styleUrl: './logged.component.css',
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
export class LoggedComponent implements OnInit, OnDestroy {
  @Output() toggleModal = new EventEmitter<void>()
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
        if (event.mainTab === 'Bills' && event.subTab === 'Logged') {
          this.executecall(event.params);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  executecall(params: Paramlist): void {
    console.log('Execute call in Bills - Logged');
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

  columnDefs: (ColDef | ColGroupDef)[] = [
    { headerName: 'MBL Depart Date (mm/dd/yyyy)', field: 'mbl_departdate', hide: false },
    { headerName: 'Location', field: 'location', width: 110 },
    {
      headerName: 'MBL Origin Port',
      field: 'mbl_originport',
      width: 110
    },
    { headerName: 'MBL Destination Port', field: 'mbl_destinationport', width: 110 },
    { headerName: 'MBL Number', field: 'mblNumber', hide: true },
    { headerName: 'O/D', field: 'od', width: 110 },
    { headerName: 'I/U', field: 'iu', width: 110 },
    { headerName: 'O/A', field: 'oa', width: 110 },
    { headerName: 'Cost Basis Code', field: 'cost_basiscode', width: 110 },
    { headerName: 'Shipment Count', field: 'shipment_count', width: 110 },
    {
      headerName: 'Manifested (USD)',
      children: [
        {
          headerName: 'Sell Amt',
          field: 'mansellAmt',
          width: 110
        },
        {
          headerName: 'Buy Amt',
          field: 'manbuyAmt',
          width: 110
        },
        {
          headerName: 'Diff',
          field: 'mandiff',
          width: 110
        },
      ]
    },
    {
      headerName: 'Local (USD)',
      children: [
        {
          headerName: 'Sell Amt',
          field: 'localsellAmt',
          width: 110
        },
        {
          headerName: 'Buy Amt',
          field: 'localbuyAmt',
          width: 110
        },
        {
          headerName: 'Diff',
          field: 'localdiff',
          width: 110
        },
      ]
    },
    { headerName: 'Total Diff Amt (USD)', field: 'totaldiff', width: 110 },
  ];


  exportData() {
    console.log('Exporting data from Logged');
  }

}
