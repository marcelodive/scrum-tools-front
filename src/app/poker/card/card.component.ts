import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() cardNumber?: number = 0;
  @Input() cardHeader?: string;
  @Input() selected: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
