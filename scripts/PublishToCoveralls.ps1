#
# Installs and runs Coveralls.exe to upload coverage files to https://coveralls.io/.
# Arguments example: -coverallsToken $(Coveralls.Token) -pathToCoverageFiles $(Build.SourcesDirectory)\CodeCoverage
#
Param(
    [string]$coverallsToken,
    [string]$pathToCoverageFiles
)

Write-Host Install tools
$basePath = (get-item $pathToCoverageFiles ).parent.FullName
$coverageAnalyzer = "C:\Program Files (x86)\Microsoft Visual Studio\2017\Enterprise\Team Tools\Dynamic Code Coverage Tools\CodeCoverage.exe"
dotnet tool install coveralls.net --version 1.0.0 --tool-path tools
$coverageUploader = ".\tools\csmacnz.Coveralls.exe"

Write-Host "Analyze coverage [$coverageAnalyzer] with args:"
$coverageFiles = Get-ChildItem -Path "$pathToCoverageFiles" -Include "*.coverage" -Recurse | Select -Exp FullName
$analyzeArgs = @(
    "analyze",
    "/output:""$pathToCoverageFiles\coverage.coveragexml"""
);
$analyzeArgs += $coverageFiles
Foreach ($i in $analyzeArgs) { Write-Host "  $i" }
."$coverageAnalyzer" @analyzeArgs

Write-Host "Upload coverage [$coverageUploader] with args"
if (Test-Path env:System_PullRequest_SourceBranch) {
    $branchName = $env:System_PullRequest_SourceBranch -replace "refs/heads/", "" }
$uploadArgs = @(
    "--dynamiccodecoverage",
    "-i ""$pathToCoverageFiles\coverage.coveragexml""",
    "-o ""$pathToCoverageFiles\coverage.json"""
    "--useRelativePaths",
    "--basePath ""$basePath""",
    "--repoToken ""$coverallsToken""",
    "--jobId ""$env:Build_BuildId""",
    "--commitId ""$env:Build_SourceVersion""",
    "--commitAuthor ""$env:Build_RequestedFor""",
    "--commitEmail ""$env:Build_RequestedForEmail""",
    "--commitMessage ""$env:Build_SourceVersionMessage"""
);
if (Test-Path env:System_PullRequest_SourceBranch)
{
    $uploadArgs += "--commitBranch ""$($env:System_PullRequest_SourceBranch -replace ""refs/heads/"", """")"""
}
else
{
    $uploadArgs += "--commitBranch ""$($env:Build_SourceBranch -replace ""refs/heads/"", """")"""
}
if (Test-Path env:System_PullRequest_PullRequestNumber)
{
    $uploadArgs += "--pullRequest ""$env:System_PullRequest_PullRequestNumber"""
}
Foreach ($i in $uploadArgs) { Write-Host "  $i" }
Start-Process $coverageUploader -ArgumentList $uploadArgs -NoNewWindow
