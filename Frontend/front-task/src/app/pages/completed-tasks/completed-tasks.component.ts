import { Component } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-completed-tasks',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './completed-tasks.component.html',
  styleUrls: ['./completed-tasks.component.scss'],
})
export class CompletedTasksComponent {}
