export class SearchHistoryResponseDto {
  id: string;
  query: string;
  filters: {
    assigneeId?: string;
    statusId?: string;
    dateFrom?: string;
    dateTo?: string;
    workspaceId?: string;
    listId?: string;
  } | null;
  createdAt: Date;
}
