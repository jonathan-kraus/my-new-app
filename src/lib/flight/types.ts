export type FlightPosition = {
  altitude: number;
  groundspeed?: number;
  heading?: number;
  latitude?: number;
  longitude?: number;
  timestamp: number;
};

type Airport = {
  code: string;
  code_iata?: string;
  city?: string;
  timezone?: string;
};

export type Flight = {
  ident: string;
  fa_flight_id: string;
  status?: string;
  progress_percent?: number;
  aircraft_type?: string;
  origin: Airport;
  destination: Airport;
  scheduled_out: string;
  estimated_out: string;
  actual_out?: string;
  scheduled_off?: string;
  estimated_off?: string;
  actual_off?: string;
  scheduled_on?: string;
  estimated_on?: string;
  actual_on?: string;
  scheduled_in: string;
  estimated_in: string;
  actual_in?: string;
  gate_origin?: string;
  gate_destination?: string;
  last_position?: FlightPosition;
};

export type FlightDashboardData = Flight & {
  live_altitude?: number | null;
  live_groundspeed?: number | null;
  live_heading?: number | null;
  live_latitude?: number | null;
  live_longitude?: number | null;
};
