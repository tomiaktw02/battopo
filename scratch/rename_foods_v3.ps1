$map = @{}
$mapFile = "c:\Users\User\Documents\battopo\scratch\rename_map.txt"
$imagesDir = "c:\Users\User\Documents\battopo\images\foods"

# Read map with UTF8 encoding
Get-Content -Path $mapFile -Encoding UTF8 | ForEach-Object {
    $parts = $_.Split(':')
    if ($parts.Length -eq 2) {
        $zh = $parts[0].Trim()
        $id = $parts[1].Trim()
        $map[$zh] = $id
    }
}

Get-ChildItem -Path $imagesDir -Filter *.png | ForEach-Object {
    $file = $_
    # Use split or replace to get the name part
    # Remove leading digits and any dots after them
    $zh = $file.BaseName -replace '^\d+[.．]?',''
    
    if ($map.ContainsKey($zh)) {
        $newName = $map[$zh] + ".png"
        Write-Host "Renaming $($file.Name) to $newName"
        Rename-Item -Path $file.FullName -NewName $newName -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "No mapping found for zh: '$zh' from file: $($file.Name)"
    }
}
