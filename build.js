const sass = require("node-sass");
const CleanCSS = require("clean-css");
const Snoowrap = require("snoowrap");
const fs = require("fs");
const child_process = require("child_process");

let target;

if (process.env.CI !== "true") {
  target = false;
} else if (process.env.TRAVIS_BRANCH === "master" && process.env.TRAVIS_PULL_REQUEST === "false") {
  target = "VolunteerLiveTeam";
} else {
  target = "VolunteerTestTeam";
}

const files = child_process
  .execSync("git diff --name-only --diff-filter=d $TRAVIS_COMMIT_RANGE")
  .toString()
  .split("\n")
  .filter(x => /\.(jpg|png)$/.exec(x));

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
  console.log(
    `Minified: efficiency ${(minifyResult.stats.efficiency * 100).toFixed(
      2
    )}%. Output size ${minifyResult.stats.minifiedSize / 1000}KB`
  );
  minified = minifyResult.styles;
} catch (e) {
  console.error(`ERROR in minifier: ${e}`);
  process.exit(1);
}

minified = minified.replace(
  `@charset "UTF-8";`,
  `/* Last modified ${new Date().toLocaleString()} */`
);

if (target === false) {
  console.log("Not running on CI; skipping applying to Reddit");
  fs.writeFileSync(__dirname + "/build.css", minified);
  process.exit(0);
} else {
  console.log(`Applying to subreddit ${target}...`);
  const options = {
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_ID,
    clientSecret: process.env.REDDIT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  };
  const r = new Snoowrap(options);

  async function checkFiles() {
    if (files.length === 0) {
      return Promise.resolve();
    }
    console.log(`Updating files ${files.join(", ")}`);
    return Promise.all(
      files.map(file => {
        return r.getSubreddit(target).uploadStylesheetImage({
          name: file.replace(/[\\/]?img[\\/]/i, "").match(/^(.+)\.[^.]+$/)[1],
          file: "./" + file,
          imageType: /^.+\.([^.]+)$/.exec(file)[1]
        });
      })
    );
  }

  checkFiles().then(
    () => {
      let reason = "";
      if (process.env.TRAVIS_PULL_REQUEST !== "false") {
        reason = `GitHub pull request ${process.env.TRAVIS_PULL_REQUEST}`;
      } else {
        reason = `GitHub commit ${process.env.TRAVIS_COMMIT}`;
      }

      // prettier-ignore
      r.getSubreddit(target)
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
    },
    err => {
      console.error(`ERROR in file uploading: ${err}`);
      process.exit(1);
    }
  );
}
