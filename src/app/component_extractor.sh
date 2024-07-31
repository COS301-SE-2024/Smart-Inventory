#!/bin/bash

# Run command to give the script executable permission
# chmod +x component_extractor.sh 

# Run command with arguments of which folders to use
# ./component_extractor.sh [-n] email-template-modal app.component.html app.routes.ts

# Initialize variable for excluding CSS
exclude_css=false

# Check if at least one argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [-n] <component1> <component2> ... [filename.extension]"
    echo "  -n: Exclude CSS files from output"
    exit 1
fi

# Check for -n flag
if [ "$1" == "-n" ]; then
    exclude_css=true
    shift
fi

# Output file
output_file="component_contents.txt"

# Clear the output file if it exists
> "$output_file"

# Function to find and process files
process_file() {
    local input=$1
    
    # Check if the input is a file in the current directory
    if [ -f "./$input" ]; then
        echo "$input:" >> "$output_file"
        cat "./$input" >> "$output_file"
        echo -e "\n" >> "$output_file"
        return 0
    fi
    
    # If not a file, treat it as a component
    local directories=("components" "pages")
    for dir in "${directories[@]}"; do
        local component_path=$(find . -type d -path "*/$dir/$input" -print -quit)
        if [ -n "$component_path" ]; then
            local file_pattern="*.component.ts|*.component.html|*.page.ts|*.page.html|*.page.scss"
            if [ "$exclude_css" = false ]; then
                file_pattern="$file_pattern|*.component.css"
            fi
            local files=$(find "$component_path" -maxdepth 1 -type f -regextype posix-extended -regex ".*($file_pattern)")
            
            for file in $files; do
                local filename=$(basename "$file")
                echo "$filename:" >> "$output_file"
                cat "$file" >> "$output_file"
                echo -e "\n" >> "$output_file"
            done
            return 0
        fi
    done
    
    echo "Warning: '$input' not found as a file or component. Skipping..."
    return 1
}

# Loop through each argument provided
for arg in "$@"; do
    process_file "$arg"
done

echo "Contents have been written to $output_file"