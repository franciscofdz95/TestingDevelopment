import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef, ColGroupDef } from 'ag-grid-community';
import { Paramlist } from '../../Models/Paramlist.model';
import { ExecuteService } from '../../Service/execute.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-location-oceanmbl',
  templateUrl: './location-oceanmbl.component.html',
  styleUrl: './location-oceanmbl.component.css',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    AgGridAngular
  ]
})
export class LocationOceanmblComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;
  private destroy$ = new Subject<void>();

  constructor(private executeService: ExecuteService) { }

  ngOnInit(): void {
    //// Execute subscription
    this.executeService.execute$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        ////////console.log('tabs: ', event);
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
    //Comment this line pls
    console.log('Execute call in Location OCEAN MBL');
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

}
