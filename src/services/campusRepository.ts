import { createFixtures } from "../modules/campus/fixtures";
import type { CampusData } from "../modules/campus/types";
// Boundary for the future API adapter. No Supabase client or network in this demo.
export interface CampusRepository {
  load(): CampusData;
}
export const demoCampusRepository: CampusRepository = { load: createFixtures };
