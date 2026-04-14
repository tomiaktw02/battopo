@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Battopo GitHub Deployment Tool
echo ========================================

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not found in your system PATH.
    echo Please run these commands inside 'Git Bash' instead, 
    echo or ensure Git for Windows is installed correctly.
    pause
    exit /b
)

:: Check if .git directory exists
if not exist ".git" (
    echo [INFO] Initializing new Git repository...
    git init
    git branch -M main
)

:: Add all files according to .gitignore
echo [INFO] Adding files...
git add .

:: Commit changes
echo [INFO] Committing changes...
git commit -m "Upload game: %date% %time%"

:: Check if remote 'origin' exists
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ACTION] Remote 'origin' is not set.
    echo Please create a NEW repository on GitHub (https://github.new),
    echo then PASTE the repository URL (e.g., https://github.com/tomiaktw02/battopo.git) below:
    set /p repo_url="Repository URL: "
    if "!repo_url!"=="" (
        echo [ERROR] URL cannot be empty.
        pause
        exit /b
    )
    git remote add origin !repo_url!
)

:: Push to main
echo [INFO] Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Upload complete!
    echo.
    echo Final step:
    echo 1. Go to your repository on GitHub.
    echo 2. Settings -> Pages
    echo 3. Select 'Deploy from a branch'
    echo 4. Branch: 'main', Folder: '/' (root)
    echo 5. Click Save.
    echo ========================================
) else (
    echo.
    echo [ERROR] Failed to push. Check your internet connection or repository permissions.
)

pause
