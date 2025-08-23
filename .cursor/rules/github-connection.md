# GitHub Connection Setup Documentation

## Overview
This document outlines the GitHub authentication setup for the `ue-eds-demo` project, including troubleshooting steps and configuration details.

## Repository Information
- **Repository:** `ComwrapUkReply/ue-eds-demo`
- **Remote URL:** `git@github.com:ComwrapUkReply/ue-eds-demo.git`
- **Authentication Method:** SSH Keys

## Git Configuration
Current Git user configuration:
- **Username:** `ComwrapUkReply`
- **Email:** `s.sznajder@reply.com`

## Authentication Setup

### SSH Authentication (Current Method)
The repository uses SSH key authentication for secure, password-free access to GitHub.

#### SSH Key Details
- **Key Type:** ED25519
- **Associated Email:** `s.sznajder@reply.com`
- **Status:** ✅ Active and working

#### Verification Commands
To verify SSH connection to GitHub:
`ssh -T git@github.com`

Expected response:
`Hi ComwrapUkReply! You've successfully authenticated, but GitHub does not provide shell access.`

#### Check SSH Keys in Agent
`ssh-add -l`

Should show loaded SSH keys including the ED25519 key.

## Common Issues and Solutions

### Issue 1: Password Authentication Error
**Error Message:**
`remote: Invalid username or token. Password authentication is not supported for Git operations.`

**Root Cause:** GitHub deprecated password authentication in 2021.

**Solution:** Switch from HTTPS to SSH authentication (already implemented).

### Issue 2: HTTPS to SSH Migration
**Original Remote URL:** `https://github.com/ComwrapUkReply/ue-eds-demo.git`
**Updated Remote URL:** `git@github.com:ComwrapUkReply/ue-eds-demo.git`

**Command Used:**
`git remote set-url origin git@github.com:ComwrapUkReply/ue-eds-demo.git`

## Configuration Commands Used

### Git User Configuration
`git config --global user.name "ComwrapUkReply"`
`git config --global user.email "s.sznajder@reply.com"`

### Credential Helper (macOS)
`git config --global credential.helper osxkeychain`

### Remote URL Update
`git remote set-url origin git@github.com:ComwrapUkReply/ue-eds-demo.git`

## Verification Steps

### 1. Check Remote Configuration
`git remote -v`

Expected output:
```
origin  git@github.com:ComwrapUkReply/ue-eds-demo.git (fetch)
origin  git@github.com:ComwrapUkReply/ue-eds-demo.git (push)
```

### 2. Test Push Operation
`git push origin main`

Should complete successfully without authentication prompts.

### 3. Verify Git Configuration
`git config --global user.name && git config --global user.email`

Expected output:
```
ComwrapUkReply
s.sznajder@reply.com
```

## Alternative Authentication Methods

### Personal Access Token (PAT)
If HTTPS authentication is required in the future:

1. Generate a Personal Access Token on GitHub:
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens
   - Create new token with appropriate scopes (`repo` for private repos)
   
2. Use token as password when prompted during Git operations

3. Store in keychain (macOS):
   `git config --global credential.helper osxkeychain`

## SSH Key Management

### SSH Config Location
SSH keys and configuration are stored in: `~/.ssh/`

### Key Files
- Private key: `~/.ssh/id_ed25519` (or similar)
- Public key: `~/.ssh/id_ed25519.pub`
- SSH config: `~/.ssh/config`

### Adding SSH Key to Agent
If SSH key is not loaded:
`ssh-add ~/.ssh/id_ed25519`

## Status
- ✅ SSH Authentication: Working
- ✅ Git Configuration: Updated
- ✅ Remote URL: Configured for SSH
- ✅ Push/Pull Operations: Functional

## Last Updated
Configuration completed and verified on the current date.

## Troubleshooting Tips

1. **Connection Issues:** Always test with `ssh -T git@github.com` first
2. **Permission Denied:** Check if SSH key is added to GitHub account
3. **Wrong Repository:** Verify remote URL matches the intended repository
4. **Commit Author:** Ensure git user.name and user.email are correctly set

---

*This documentation was created to resolve GitHub authentication issues and ensure smooth development workflow.*