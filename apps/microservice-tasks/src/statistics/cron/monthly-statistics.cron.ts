import { Injectable} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StatisticsService } from '../statistics.service';

@Injectable()
export class MonthlyStatisticsCron {

  constructor(private readonly statisticsService: StatisticsService) {}
  @Cron('0 0 1 1 *') 
  async handleMonthlyStatistics() {
    const now = new Date();
    let month = now.getMonth() + 1; // Mes actual (1-12)
    let year = now.getFullYear();

    if (month === 1) {
      month = 12;
      year -= 1; 
    }
    await this.statisticsService.generateAndNotify(month, year);

    
  }
}
