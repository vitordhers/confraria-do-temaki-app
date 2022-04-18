import { Component, Input, OnInit } from '@angular/core';
import { IUnit } from 'src/app/shared/interfaces/unit.interface';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  @Input() unit!: IUnit;
  @Input() zoom = 19;

  center: google.maps.LatLngLiteral = { lat: -22.712736, lng: -47.646485 };

  constructor() {}

  ngOnInit() {
    this.center.lat = this.unit.lat;
    this.center.lng = this.unit.lng;
  }
}
