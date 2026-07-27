@echo off
cd /d d:\ObsidianVault\networkfunk-production-os
git log --oneline -3 > git_commit_log.txt 2>&1
git add -A
git commit -m "NPOS Production Hub: Enhanced calculators, Serum preset analyzer, unified navigation, and tests"
echo COMMIT_RESULT=%ERRORLEVEL% >> git_commit_log.txt
dir d:\ObsidianVault\networkfunk-production-os\git_commit_log.txt
type d:\ObsidianVault\networkfunk-production-os\git_commit_log.txt