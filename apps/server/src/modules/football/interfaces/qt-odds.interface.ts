export interface QtOddsDetail {
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
}

export interface QtOddsResponse {
  companies: Array<{
    companyId: number;
    details: Array<{
      homeOdds: number;
      drawOdds: number;
      awayOdds: number;
      [key: string]: any;
    }>;
  }>;
} 