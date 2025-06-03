export interface JobResponse {
  job_id: number;
}

export interface JobStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  mesh_url?: string;
  progress?: number;
  error_message?: string;
}
