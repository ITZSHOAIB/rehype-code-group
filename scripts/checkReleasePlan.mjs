import getReleasePlan from "@changesets/get-release-plan";

const releasePlan = await getReleasePlan(process.cwd());

console.log(
  `Release plan valid: ${releasePlan.changesets.length} changeset(s), ${releasePlan.releases.length} release(s).`,
);
