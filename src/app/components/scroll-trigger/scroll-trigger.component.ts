import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-scroll-trigger',
  templateUrl: './scroll-trigger.component.html',
  styleUrls: ['./scroll-trigger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollTriggerComponent implements OnInit {
  @ViewChild('trigger', { static: true })
  public trigger!: ElementRef<HTMLDivElement>;

  constructor(private navigationService: NavigationService) {}

  ngOnInit() {
    this.navigationService.observeElement(this.trigger);
  }
}
