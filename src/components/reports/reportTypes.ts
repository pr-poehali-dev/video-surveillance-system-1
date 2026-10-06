export interface ReportCamera {
  id: number;
  name: string;
  owner: string | null;
  status: string | null;
  territorial_division: string | null;
  rtsp_url: string | null;
  fps: number | null;
  updated_at: string | null;
}
