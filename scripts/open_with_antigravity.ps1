#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir

if (-not (Get-Command antigravity -ErrorAction SilentlyContinue)) {
    Write-Error "Error: antigravity CLI is not installed or not on PATH."
    exit 1
}

antigravity open "$RepoRoot"