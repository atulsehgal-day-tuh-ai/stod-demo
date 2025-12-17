# 🖥️ Running the App Locally

## Quick Start

1. **Clean build cache (if you get errors):**
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```

2. **Install dependencies (if needed):**
   ```powershell
   npm install
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```
   Or for port 3003:
   ```powershell
   npm run dev:3003
   ```

4. **Open your browser:**
   - Default: [http://localhost:3000](http://localhost:3000)
   - Or: [http://localhost:3003](http://localhost:3003) (if using the 3003 script)

## Fixing the "Cannot find module './480.js'" Error

This error happens when the build cache gets corrupted. Here's how to fix it:

### Step 1: Stop the dev server
Press `Ctrl+C` in the terminal where the server is running.

### Step 2: Clean the build cache
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### Step 3: Clean npm cache (if needed)
```powershell
npm cache clean --force
```

### Step 4: Restart the dev server
```powershell
npm run dev
```

## Common Issues & Solutions

### Issue: Port already in use
**Error:** `Port 3000 is already in use`

**Solution:** 
- Use a different port: `npm run dev:3003`
- Or kill the process using port 3000:
  ```powershell
  # Find process using port 3000
  netstat -ano | findstr :3000
  # Kill it (replace PID with the number from above)
  taskkill /PID <PID> /F
  ```

### Issue: Module not found errors
**Solution:**
1. Delete `node_modules` and `.next`:
   ```powershell
   Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue
   ```
2. Reinstall:
   ```powershell
   npm install
   ```
3. Restart:
   ```powershell
   npm run dev
   ```

### Issue: OneDrive sync conflicts
If your project is in OneDrive, sometimes it can cause build issues.

**Solution:**
1. Exclude `.next` and `node_modules` from OneDrive sync
2. Or move the project outside OneDrive

### Issue: TypeScript errors
**Solution:**
```powershell
npm run lint
```
Fix any errors shown, then restart the dev server.

## Development Tips

- **Hot Reload:** Changes to your code automatically refresh the browser
- **Error Overlay:** Errors appear directly in the browser
- **Fast Refresh:** React components update without losing state
- **Console Logs:** Check browser console (F12) and terminal for errors

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Next Steps

Once the app is running locally:
- Test all features
- Make your changes
- When ready, deploy to Vercel (see `QUICK_DEPLOY.md`)

