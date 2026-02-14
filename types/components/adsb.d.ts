export interface ADSBResponse {
  response: {
    flightroute: FlightRoute;
  };
}

export interface FlightRoute {
  callsign: string;
  callsign_icao: string;
  callsign_iata: string;
  airline: {
    name: string;
    icao: string;
    iata: string;
    country: string;
    country_iso: string;
    callsign: string;
  };
  origin: Airport;
  destination: Airport;
}

export interface Airport {
  country_iso_name: string;
  country_name: string;
  elevation: number;
  iata_code: string;
  icao_code: string;
  latitude: number;
  longitude: number;
  municipality: string;
  name: string;
}
