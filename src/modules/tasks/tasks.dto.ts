export interface CreateTaskDto {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  tag_id?: string;
  project_id?: string;
}
