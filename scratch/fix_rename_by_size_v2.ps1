$imagesDir = "c:\Users\User\Documents\battopo\images\foods"
$sizeToId = @{
    "67688" = "rice"; "36365" = "tofu"; "59733" = "radish"; "56961" = "beansprouts"; "44602" = "banana"
    "95279" = "brownrice"; "59794" = "onion"; "77378" = "garlic"; "64014" = "waterbamboo"; "36572" = "yam"
    "85796" = "cabbage"; "73393" = "cauliflower"; "70528" = "corn"; "72955" = "pear"; "43221" = "sweetpotato"
    "89468" = "egg"; "58322" = "kingoyster"; "71463" = "lemon"; "69209" = "threadfin"; "43201" = "bittermelon"
    "71744" = "blackbean"; "68468" = "blacksesame"; "58653" = "woodear"; "88376" = "purplerice"; "36922" = "eggplant"
    "69118" = "blueberry"; "90167" = "mulberry"; "71442" = "grape"; "68746" = "grassjelly"; "147053" = "shiitake"
    "74381" = "kelp"; "65699" = "seaweed"; "47304" = "pepper"; "70344" = "centuryegg"; "75746" = "blackdate"
    "58262" = "silkie"; "53454" = "plum"; "109355" = "perilla"; "61008" = "fig"; "80983" = "cocoa"
    "86146" = "redbean"; "60940" = "dragonfruit"; "53819" = "tomato"; "88494" = "watermelon"; "94310" = "strawberry"
    "79630" = "cherry"; "92704" = "apple"; "85779" = "jujube"; "74673" = "goji"; "78496" = "beetroot"
    "57687" = "beef"; "38671" = "pork"; "49036" = "mutton"; "98546" = "waxapple"; "74505" = "cranberry"
    "108955" = "hibiscus"; "61550" = "bellpepper"; "85686" = "chili"; "112006" = "pomegranate"; "79207" = "shrimp"
    "44941" = "carrot"; "67889" = "persimmon"; "92629" = "papaya"; "74606" = "orange"; "101818" = "mandarin"
    "60871" = "loquat"; "66836" = "salmon"; "51138" = "cantaloupe"; "89363" = "peach"; "80226" = "pineapple"
    "87234" = "physalis"; "79552" = "salmonroe"; "85061" = "seaurchin"; "83471" = "mango"; "72199" = "pumpkin"
    "83255" = "honey"; "48911" = "turmeric"; "72626" = "wheat"; "64964" = "cheese"; "69548" = "flowercrab"
    "75600" = "bokchoy"; "82206" = "spinach"; "125853" = "waterspinach"; "125183" = "sweetpotatoleaf"; "121644" = "broccoli"
    "114291" = "luffa"; "72242" = "asparagus"; "50387" = "cucumber"; "72952" = "greenpepper"; "65658" = "okra"
    "89985" = "chives"; "80361" = "kiwi"; "62351" = "guava"; "75810" = "avocado"; "84121" = "coriander"
    "106541" = "edamame"; "77442" = "mungbean"; "78664" = "matcha"; "91005" = "celery"; "84117" = "dragonmustache"
}

# Move all current files to a temp prefix to avoid collision
Get-ChildItem -Path $imagesDir -Filter *.png | ForEach-Object {
    Rename-Item -Path $_.FullName -NewName ("temp_" + $_.Name)
}

# Now rename based on size
Get-ChildItem -Path $imagesDir -Filter temp_*.png | ForEach-Object {
    $file = $_
    $size = $file.Length.ToString()
    if ($sizeToId.ContainsKey($size)) {
        $newName = $sizeToId[$size] + ".png"
        Write-Host "Renaming $($file.Name) ($size bytes) to $newName"
        # Overwrite if exists (shouldn't happen with temp prefix but good for safety)
        if (Test-Path -Path (Join-Path $imagesDir $newName)) {
            Remove-Item -Path (Join-Path $imagesDir $newName)
        }
        Rename-Item -Path $file.FullName -NewName $newName
    } else {
        Write-Host "UNKNOWN SIZE: $size in $($file.Name)"
    }
}
