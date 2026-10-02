export * from "./http";
export * from "./dashboard";
export * from "./athletes";
export * from "./tournaments";
export * from "./matches";
export * from "./arenas";
export * from "./judges";
export * from "./judge-sessions";

import { dashboardApi } from "./dashboard";
import { athletesApi } from "./athletes";
import { tournamentsApi } from "./tournaments";
import { matchesApi } from "./matches";
import { arenasApi } from "./arenas";
import { judgesApi } from "./judges";
import { judgeSessionsApi } from "./judge-sessions";

export const apiClient = {
  dashboard: dashboardApi,
  athletes: athletesApi,
  tournaments: tournamentsApi,
  matches: matchesApi,
  arenas: arenasApi,
  judges: judgesApi,
  judgeSessions: judgeSessionsApi,
};
