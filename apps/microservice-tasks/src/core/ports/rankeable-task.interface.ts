export interface IRankableTask {
  id: number;
  completedByUserId: number;
  dashboardId: number;
  endDate?: Date;
  finishDate?: Date;
  priority?: {
    name: string;
  };
}