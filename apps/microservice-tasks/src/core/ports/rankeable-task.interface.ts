export interface IRankableTask {
  id: number;
  assignedToUserId: number;
  reviewedByUserId: number;
  dashboardId: number;
  endDate?: Date;
  finishDate?: Date;
  priority?: {
    name: string;
  };
}