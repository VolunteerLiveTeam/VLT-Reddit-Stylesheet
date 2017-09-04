if (process.env.TRAVIS_PULL_REQUEST !== "false" && process.env.TRAVIS_PULL_REQUEST_SLUG.indexOf("VolunteerLiveTeam") !== -1) {
    console.log(`*CANNOT CONTINUE BUILD*
For security reasons, we cannot run builds on PRs from forks.
Please wait for a maintainer to merge it into dev and build it from there`);
    process.exit(1);
}