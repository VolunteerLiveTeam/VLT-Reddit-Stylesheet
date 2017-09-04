const sass = require("node-sass");
const CleanCSS = require("clean-css");
const Snoowrap = require("snoowrap");
const fs = require("fs");
const { promisify } = require("util");

let target;

if (process.env.CI !== "true") {
  target = false;
  // prettier-ignore
} else if (
  process.env.TRAVIS_PULL_REQUEST !== "false" &&
  process.env.TRAVIS_BRANCH === "master"
) {
  target = "VolunteerPublishTeam";
} else {
  if (process.env.TRAVIS_BRANCH === "master") {
    target = "VolunteerLiveTeam";
  } else {
    target = "VolunteerTestTeam";
  }
}

console.log("Running Sass...");
let resultCss;

try {
  resultCss = sass.renderSync({
    file: __dirname + "/sass/index.scss"
  }).css;
} catch (e) {
  console.error(`ERROR in Sass: ${e}`);
  process.exit(1);
}

console.log("Minifying...");
let minified;

try {
  const minifier = new CleanCSS({ returnPromise: false });
  const minifyResult = minifier.minify(resultCss);
  console.log(`Minified: efficiency ${(minifyResult.stats.efficiency * 100).toFixed(2)}%. Output size ${minifyResult.stats.minifiedSize / 1000}KB`);
  minified = minifyResult.styles;
} catch (e) {
  console.error(`ERROR in minifier: ${e}`);
  process.exit(1);
}

if (target === false) {
  console.log("Not running on CI; skipping applying to Reddit");
  fs.writeFileSync(__dirname + "/build.css", minified);
  process.exit(0);
} else {
  console.log(`Applying to subreddit ${target}...`);
  const r = new Snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_ID,
    clientSecret: process.env.REDDIT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  });

  let reason = "";
  if (process.env.TRAVIS_PULL_REQUEST !== "false") {
    reason = `GitHub pull request ${process.env.TRAVIS_PULL_REQUEST}`;
  } else {
    reason = `GitHub commit ${process.env.TRAVIS_COMMIT}`;
  }

  r
    .getSubreddit(target)
    .updateStylesheet({
      css: minified,
      reason
    })
    .then(
      () => {
        console.log("Done.");
        process.exit(0);
      },
      e => {
        console.error(`ERROR in reddit: ${e}`);
        process.exit(1);
      }
    );
}
