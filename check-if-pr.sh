#!/bin/bash

if [ "$TRAVIS_PULL_REQUEST" == "true" ] && [ "$TRAVIS_PULL_REQUEST_SLUG" != *"VolunteerLiveTeam"* ]; then
    echo "*CANNOT CONTINUE BUILD*"
    echo "For security reasons, we cannot run builds on PRs from forks."
    echo "Please wait for a maintainer to merge your PR into dev, then they'll build it from dev."
    exit 1
fi