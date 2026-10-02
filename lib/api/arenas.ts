import { http } from "./http";
import { Arena } from "@/lib/types";

export const arenasApi = {
  list: (): Promise<Arena[]> => {
    return http.get<Arena[]>("/api/arenas");
  },
};
