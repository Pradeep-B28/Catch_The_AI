$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\DELL\.gemini\antigravity-cli\brain\023e1d2d-0384-4ce3-81c9-7946d4711cd2"

Write-Host "Capturing theme-light-home.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--blink-settings=preferredColorScheme=0", "--window-size=1440,900", "--screenshot=$outDir\theme-light-home.png", "http://localhost:8000/" -Wait

Write-Host "Capturing theme-dark-home.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--blink-settings=preferredColorScheme=1", "--window-size=1440,900", "--screenshot=$outDir\theme-dark-home.png", "http://localhost:8000/" -Wait

Write-Host "Capturing theme-light-play.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--blink-settings=preferredColorScheme=0", "--window-size=390,844", "--virtual-time-budget=3500", "--screenshot=$outDir\theme-light-play.png", "http://localhost:8000/?demo=1&n=3&theme=light" -Wait

Write-Host "Capturing theme-dark-play.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--blink-settings=preferredColorScheme=1", "--window-size=390,844", "--virtual-time-budget=3500", "--screenshot=$outDir\theme-dark-play.png", "http://localhost:8000/?demo=1&n=3&theme=dark" -Wait

Write-Host "All Phase 5 theme captures complete!"
