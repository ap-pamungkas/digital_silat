import { http } from "./http";
import { Athlete } from "@/lib/types";

export interface CreateAthleteDto {
  name: string;
  contingent: string;
  contingentCode?: string;
  gender: "PUTRA" | "PUTRI";
  weightClass: string;
}

export interface UpdateAthleteDto extends Partial<CreateAthleteDto> {
  seed?: number;
}

export const athletesApi = {
  list: (): Promise<Athlete[]> => {
    return http.get<Athlete[]>("/api/athletes");
  },

  create: (data: CreateAthleteDto): Promise<Athlete> => {
    return http.post<Athlete>("/api/athletes", data);
  },

  update: (id: string, data: UpdateAthleteDto): Promise<Athlete> => {
    return http.patch<Athlete>(`/api/athletes/${id}`, data);
  },

  delete: (id: string): Promise<{ success: boolean }> => {
    return http.delete<{ success: boolean }>(`/api/athletes/${id}`);
  },
};
