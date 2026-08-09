function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

export type ProgramSubscriptionPlan = {
  mergedProgramIds: string[];
  followProgramIds: string[];
  unfollowProgramIds: string[];
};

export function reconcileProgramSubscriptions(
  localProgramIds: readonly string[],
  serverProgramIds: readonly string[],
  manageableProgramIds: readonly string[],
  migrationComplete: boolean,
): ProgramSubscriptionPlan {
  const local = unique(localProgramIds);
  const server = unique(serverProgramIds);
  const manageable = new Set(manageableProgramIds);
  const mergedProgramIds = migrationComplete
    ? local
    : unique([...local, ...server]);
  return {
    mergedProgramIds,
    followProgramIds: mergedProgramIds.filter((id) => !server.includes(id)),
    unfollowProgramIds: migrationComplete
      ? server.filter((id) => manageable.has(id) && !local.includes(id))
      : [],
  };
}
