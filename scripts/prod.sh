#!/bin/bash

# Read the version from squid.yaml
version=$(grep '^version:' squid.yaml | awk '{print $2}')

# Check if version was found
if [ -z "$version" ]; then
    echo "Error: Version not found in squid.yaml"
    exit 1
fi

# Run the sqd tags add command
sqd tags add prod -n mibera-squid -s v$version

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "Successfully added tag prod for mibera-squid version v$version"
else
    echo "Error: Failed to add tag"
    exit 1
fi