$mapFile = "c:\Users\User\Documents\battopo\scratch\rename_map.txt"
$imagesDir = "c:\Users\User\Documents\battopo\images\foods"

# Read map with UTF8 encoding
$lines = Get-Content -Path $mapFile -Encoding UTF8

$files = Get-ChildItem -Path $imagesDir -Filter *.png

foreach ($line in $lines) {
    if ($line -match '^(.+):(.+)$') {
        $zh = $Matches[1].Trim()
        $id = $Matches[2].Trim()
        
        # Find file that ends with this zh name + .png, 
        # but also handles the NNN. prefix
        foreach ($file in $files) {
            # Check if filename contains the zh string
            # We check for .zh.png or NNNzh.png
            if ($file.Name -like "*$zh.png") {
                $newName = "$id.png"
                if ($file.Name -ne $newName) {
                    Write-Host "Renaming $($file.Name) to $newName"
                    Rename-Item -Path $file.FullName -NewName $newName -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
}
