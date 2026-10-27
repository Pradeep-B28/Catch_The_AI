$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\DELL\.gemini\antigravity-cli\brain\023e1d2d-0384-4ce3-81c9-7946d4711cd2"

Write-Host "Capturing share-score-6-status.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1080,1920", "--virtual-time-budget=1000", "--screenshot=$outDir\share-score-6-status.png", "http://localhost:8000/tools/render_share.html?score=6&size=status" -Wait

Write-Host "Capturing share-score-6-post.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1080,1350", "--virtual-time-budget=1000", "--screenshot=$outDir\share-score-6-post.png", "http://localhost:8000/tools/render_share.html?score=6&size=post" -Wait

Write-Host "Capturing share-score-8-status.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1080,1920", "--virtual-time-budget=1000", "--screenshot=$outDir\share-score-8-status.png", "http://localhost:8000/tools/render_share.html?score=8&size=status" -Wait

Write-Host "Capturing share-score-8-post.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1080,1350", "--virtual-time-budget=1000", "--screenshot=$outDir\share-score-8-post.png", "http://localhost:8000/tools/render_share.html?score=8&size=post" -Wait

Write-Host "Capturing challenge-banner.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=390,844", "--screenshot=$outDir\challenge-banner.png", "http://localhost:8000/?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6" -Wait

Write-Host "Capturing challenge-banner-desktop.png..."
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1440,900", "--screenshot=$outDir\challenge-banner-desktop.png", "http://localhost:8000/?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6" -Wait

Write-Host "All Phase 4 captures complete!"
