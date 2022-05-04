import { Component, OnInit } from '@angular/core';
import { navigateExternalLink } from '../../shared/functions/navigate-external-link.function';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  galleryImgs = [
    'https://d1sebrm9qxhird.cloudfront.net/product_img/image1.png',
    'https://d1sebrm9qxhird.cloudfront.net/product_img/image2.png',
    'https://d1sebrm9qxhird.cloudfront.net/product_img/image3.png',
    'https://d1sebrm9qxhird.cloudfront.net/product_img/image4.png',
    'https://d1sebrm9qxhird.cloudfront.net/product_img/image5.png',
    'https://d1sebrm9qxhird.cloudfront.net/product_img/image6.png',
  ];
  navigateExternalLink = navigateExternalLink;

  constructor() {}

  ngOnInit() {}
}
