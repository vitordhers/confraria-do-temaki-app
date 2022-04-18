import { Component, OnInit } from '@angular/core';
import { navigateExternalLink } from '../../shared/functions/navigate-external-link.function';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  navigateExternalLink = navigateExternalLink;

  constructor() {}

  ngOnInit() {}
}
