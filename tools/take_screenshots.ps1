$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\DELL\.gemini\antigravity-cli\brain\023e1d2d-0384-4ce3-81c9-7946d4711cd2"

$shots = @(
  @{ name = "typing-phone.png"; size = "390,844"; url = "http://localhost:8000/?preview=typing" },
  @{ name = "picked-phone.png"; size = "390,844"; url = "http://localhost:8000/?preview=picked" },
  @{ name = "caught-phone.png"; size = "390,844"; url = "http://localhost:8000/?preview=caught" },
  @{ name = "missed-phone.png"; size = "390,844"; url = "http://localhost:8000/?preview=missed" },
  @{ name = "timeout-phone.png"; size = "390,844"; url = "http://localhost:8000/?preview=timeout" },
  @{ name = "result-phone.png"; size = "390,844"; url = "http://localhost:8000/?preview=result" },
  @{ name = "result-desktop.png"; size = "1440,900"; url = "http://localhost:8000/?preview=result" }
)

foreach ($s in $shots) {
  $target = "$outDir\$($s.name)"
  Write-Host "Capturing $($s.name)..."
  Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=$($s.size)", "--screenshot=$target", $s.url -Wait
}
Write-Host "All screenshots captured successfully!"
