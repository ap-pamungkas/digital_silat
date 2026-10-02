/**
 * Compile-time contract checks between the client request DTOs (lib/api) and
 * the server validation schemas (lib/validation).
 *
 * This module is never imported at runtime, so zod does not reach the browser
 * bundle. The exported constant exists only so TypeScript must verify the
 * contract: when a DTO drifts from its schema the value `true` is no longer
 * assignable to `never` and the build fails.
 */

import type { CreateAthleteDto, UpdateAthleteDto } from "./athletes";
import type { CreateJudgeDto, UpdateJudgeDto } from "./judges";
import type { VerifyJudgeSessionDto } from "./judge-sessions";
import type {
  ApplyPenaltyDto,
  CreateMatchDto,
  DecideScoreEventDto,
  SubmitScoreEventDto,
  UpdateMatchScheduleDto,
  UpdateMatchStatusDto,
  UpdateTimerDto,
} from "./matches";
import type { CreateTournamentDto, UpdateTournamentDto } from "./tournaments";

import type {
  CreateAthleteInput,
  CreateJudgeInput,
  CreateMatchInput,
  CreatePenaltyInput,
  CreateTournamentInput,
  DecideScoreEventInput,
  SubmitScoreEventInput,
  UpdateAthleteInput,
  UpdateJudgeInput,
  UpdateMatchScheduleInput,
  UpdateMatchStatusInput,
  UpdateTimerInput,
  UpdateTournamentInput,
  VerifyJudgeSessionInput,
} from "@/lib/validation";

type IsAssignable<From, To> = [From] extends [To] ? true : false;

type HasOnlyHandledFields<ClientDto, ServerInput> = [Exclude<keyof ClientDto, keyof ServerInput>] extends [never]
  ? true
  : never;

type ContractCheck<ClientDto, ServerInput> =
  IsAssignable<ClientDto, ServerInput> extends true
    ? HasOnlyHandledFields<ClientDto, ServerInput>
    : never;

export const apiContracts: {
  athleteCreate: ContractCheck<CreateAthleteDto, CreateAthleteInput>;
  athleteUpdate: ContractCheck<UpdateAthleteDto, UpdateAthleteInput>;
  judgeCreate: ContractCheck<CreateJudgeDto, CreateJudgeInput>;
  judgeUpdate: ContractCheck<UpdateJudgeDto, UpdateJudgeInput>;
  judgeSessionVerify: ContractCheck<VerifyJudgeSessionDto, VerifyJudgeSessionInput>;
  matchCreate: ContractCheck<CreateMatchDto, CreateMatchInput>;
  matchScheduleUpdate: ContractCheck<UpdateMatchScheduleDto, UpdateMatchScheduleInput>;
  matchStatusUpdate: ContractCheck<UpdateMatchStatusDto, UpdateMatchStatusInput>;
  scoreEventSubmit: ContractCheck<SubmitScoreEventDto, SubmitScoreEventInput>;
  scoreEventDecision: ContractCheck<DecideScoreEventDto, DecideScoreEventInput>;
  penaltyApply: ContractCheck<ApplyPenaltyDto, CreatePenaltyInput>;
  timerUpdate: ContractCheck<UpdateTimerDto, UpdateTimerInput>;
  tournamentCreate: ContractCheck<CreateTournamentDto, CreateTournamentInput>;
  tournamentUpdate: ContractCheck<UpdateTournamentDto, UpdateTournamentInput>;
} = {
  athleteCreate: true,
  athleteUpdate: true,
  judgeCreate: true,
  judgeUpdate: true,
  judgeSessionVerify: true,
  matchCreate: true,
  matchScheduleUpdate: true,
  matchStatusUpdate: true,
  scoreEventSubmit: true,
  scoreEventDecision: true,
  penaltyApply: true,
  timerUpdate: true,
  tournamentCreate: true,
  tournamentUpdate: true,
};