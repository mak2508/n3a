#!/usr/bin/env bash

# Make sure only one argument is passed
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <input_file>" >&2
    exit 1
fi

# Check if the input file exists
if [ ! -f "$1" ]; then
    echo "File not found!" >&2
    exit 1
fi

cat "$1" | sed -E 's/\[|\]//g' | sed -E 's/\([^\)]*\)//g' | sed -E 's/\?\./\?/g'
