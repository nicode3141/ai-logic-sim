$content = [System.IO.File]::ReadAllText("$pwd/index.html")
$lines = $content.Split("`n")
$open = 0
$close = 0
for ($i = 0; $i -lt $lines.Length; $i++) {
    $chars = $lines[$i].ToCharArray()
    foreach ($ch in $chars) {
        if ($ch -eq '{') { $open++ }
        if ($ch -eq '}') { $close++ }
    }
    if ($i -ge 8356) {
        $diff = $open - $close
        if ($diff -le 0) {
            Write-Host "Dropped to $diff at line $($i+1): $($lines[$i].Trim())"
            break
        }
    }
}
