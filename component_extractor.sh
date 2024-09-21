#!/bin/bash

# Initialize variables
exclude_css=false
output_file="component_contents.txt"

# Function to print usage
print_usage() {
    echo "Usage: $0 [-n] <folder1> <folder2> ... <file1.ext> <file2.ext> ..."
    echo "  -n: Exclude CSS files from output"
    exit 1
}

# Check if at least one argument is provided
if [ $# -eq 0 ]; then
    print_usage
fi

# Check for -n flag
if [ "$1" == "-n" ]; then
    exclude_css=true
    shift
fi

# Clear the output file if it exists
> "$output_file"

# Function to find and process files or folders
process_input() {
    local input=$1
    local found=false

    # Check if input is a folder
    local folders=$(find ./src ./amplify/services -type d -name "$input" 2>/dev/null)
    if [ -n "$folders" ]; then
        for folder in $folders; do
            echo "Contents of folder $folder:" >> "$output_file"
            for file in "$folder"/*; do
                if [ -f "$file" ]; then
                    local filename=$(basename "$file")
                    if [ "$exclude_css" = true ] && [[ "$filename" == *.css ]]; then
                        continue
                    fi
                    echo "  $filename:" >> "$output_file"
                    cat "$file" >> "$output_file"
                    echo -e "\n" >> "$output_file"
                    found=true
                fi
            done
        done
    else
        # If not a folder, search for the file
        local files=$(find ./src ./amplify/services -type f -name "$input" 2>/dev/null)
        if [ -n "$files" ]; then
            for file in $files; do
                local filename=$(basename "$file")
                if [ "$exclude_css" = true ] && [[ "$filename" == *.css ]]; then
                    continue
                fi
                echo "$filename:" >> "$output_file"
                cat "$file" >> "$output_file"
                echo -e "\n" >> "$output_file"
                found=true
            done
        fi
    fi

    if [ "$found" = false ]; then
        echo "Warning: '$input' not found as a folder or file. Skipping..."
    fi
}

# Loop through each argument provided
for arg in "$@"; do
    process_input "$arg"
done

echo "Contents have been written to $output_file"