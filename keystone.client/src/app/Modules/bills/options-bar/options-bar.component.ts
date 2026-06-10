import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-options-bar',
  templateUrl: './options-bar.component.html',
  styleUrl: './options-bar.component.css',
  imports: [
    CommonModule,
  ]
})
export class OptionsBarComponent implements OnInit {
  
  @Output() toggle = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  //@Input() isPayment:boolean = false;
  _isPayment: boolean = false;
  @Input()
  set isPayment(value: boolean | undefined) {
    this._isPayment = value ?? false;
  }
  get isPayment(): boolean {
    return this._isPayment;
  }
  incInvoices: number = 28;

  ngOnInit(): void {
  }
}
