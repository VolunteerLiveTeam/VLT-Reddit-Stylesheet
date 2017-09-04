# VLT Reddit Stylesheet

This repository has the stylesheet for [/r/VolunteerLiveTeam](https://reddit.com/r/VolunteerLiveTeam).

The stylesheet itself is a customized version of the [Naut theme](https://reddit.com/r/Naut/).

## How It Works

All the source CSS is in the [sass](https://github.com/VolunteerLiveTeam/VLT-Reddit-Stylesheet/tree/dev/sass) folder. Upon a commit to the `dev` branch, Travis CI will build the CSS and apply it to [/r/VolunteerTestTeam](https://reddit.com/r/VolunteerTestTeam). Upon a pull request to `master`, Travis will build the pull request to [/r/VolunteerPublishTeam](https://reddit.com/r/VolunteerPublishTeam) as a final test. Then, when the PR is merged, Travis will build and apply it to [/r/VolunteerLiveTeam](https://reddit.com/r/VolunteerLiveTeam).

## License

The build script and stylesheets are copyright (c) 2017 Volunteer Live Team, licensed under the MIT License. The Naut theme is copyright (c) 2017 Axel Schoterman, licensed under the MIT License.
