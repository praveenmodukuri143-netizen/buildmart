$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $root 'index.html'
$scriptPath = Join-Path $root 'script.js'

if (!(Test-Path $indexPath)) { throw "index.html not found. Put this folder inside the buildmart repository and run again." }
if (!(Test-Path $scriptPath)) { throw "script.js not found. Put this folder inside the buildmart repository and run again." }

# Add one clean, fixed image frame. Original images stay untouched.
$html = Get-Content -Raw -Encoding UTF8 $indexPath
$imageCss = @'

/* ================= UNIFORM ORIGINAL PRODUCT IMAGES ================= */
.product-image {
  height: 220px !important;
  min-height: 220px !important;
  overflow: hidden !important;
  display: grid !important;
  place-items: center !important;
  padding: 10px !important;
}
.product-image img {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  display: block !important;
}
@media (max-width: 720px) {
  .product-image {
    height: 190px !important;
    min-height: 190px !important;
  }
}
@media (max-width: 480px) {
  .product-image {
    height: 210px !important;
    min-height: 210px !important;
  }
}
'@
$html = $html -replace '(?s)</style>\s*</head>', ($imageCss + "`n</style>`n</head>")
Set-Content -Path $indexPath -Value $html -Encoding UTF8

# Replace only the old emoji material visual helper; all other JS stays unchanged.
$js = Get-Content -Raw -Encoding UTF8 $scriptPath
$pattern = '(?s)function getMaterialVisual\(name\)\s*\{.*?\n\}'
$newFunction = @'
function getMaterialVisual(name) {

  const value = String(name || "").toLowerCase();
  let image = "";

  if (value.includes("cement varra")) {
    image = "assets/products/cement-varra.png";
  } else if (value.includes("ramco") || (value.includes("cement") && !value.includes("ring") && !value.includes("varra"))) {
    image = "assets/products/ramco-cement.png";
  } else if (value.includes("ring") || value.includes("well")) {
    image = "assets/products/cement-rings.png";
  } else if (value.includes("iron") || value.includes("steel") || /(^|\s)(6|8|10|12)\s*mm/.test(value)) {
    image = "assets/products/iron-rods.png";
  } else if (value.includes("brick")) {
    image = "assets/products/red-bricks.png";
  } else if (value.includes("sand")) {
    image = "assets/products/sand.png";
  } else if (value.includes("3/4") || value.includes("3-4") || value.includes("aggregate")) {
    image = "assets/products/3-4-aggregates.png";
  } else if (value.includes("baby") || value.includes("chips")) {
    image = "assets/products/baby-chips.png";
  } else if (value.includes("dust")) {
    image = "assets/products/dust.png";
  }

  if (!image) return "🏗️";

  return `<img src="${image}" alt="${escapeHtml(name || "Building material")}" loading="lazy">`;
}
'@
if ($js -notmatch $pattern) { throw "Could not find getMaterialVisual() in script.js." }
$js = [regex]::Replace($js, $pattern, $newFunction, 1)
Set-Content -Path $scriptPath -Value $js -Encoding UTF8

Write-Host "DONE - Original product images wired with one uniform, non-distorting display size." -ForegroundColor Green
Write-Host "Note: Cement Varra will use assets/products/cement-varra.png when that original file is present." -ForegroundColor Yellow
