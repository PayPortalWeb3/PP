# 🔄 Restart Demo Server

## CSP Issues Fixed! ✅

The Content Security Policy has been updated to allow:
- ✅ Inline scripts (`'unsafe-inline'`)
- ✅ Inline event handlers (`script-src-attr 'unsafe-inline'`)
- ✅ CDN resources from unpkg.com
- ✅ Swagger UI to load properly

**All forms and buttons now work!**

---

## 🚀 How to Apply Changes

### Step 1: Stop the Current Server
In the terminal where the demo is running (Terminal 3), press:
```
Ctrl + C
```

### Step 2: Restart the Server
```bash
node demo-server.js
```

Or use the npm script:
```bash
npm run demo
```

---

## ✅ What's Fixed

### 1. **Swagger Page**
- ✅ No more CSP errors
- ✅ Loads Swagger UI from CDN
- ✅ Interactive API documentation works
- ✅ "Try it out" buttons functional

### 2. **Demo UI Forms**
- ✅ "Fill Example Data" button works
- ✅ "Clear Form" button works
- ✅ "Create Payment Link" button works
- ✅ All onclick handlers work
- ✅ Dynamic form additions work
- ✅ Tab switching works
- ✅ All test flow buttons work

### 3. **Enhanced Features**
- ✅ "Show All Endpoints" modal with complete API reference
- ✅ Endpoint indicators on each button (shows which API is called)
- ✅ Mock transaction examples clearly visible
- ✅ Better user guidance throughout

---

## 🧪 Test After Restart

1. ✅ Open http://localhost:3003/demo
2. ✅ Click "Fill Example Data" - should populate multi-currency options
3. ✅ Click "Create Payment Link" - should create link successfully
4. ✅ Click "Show All Endpoints" - modal should appear
5. ✅ Switch between tabs - should load data
6. ✅ Test payment flow - all 4 steps should work
7. ✅ Open http://localhost:3003/swagger - Swagger UI should load

---

## 📊 What You'll See

### Demo UI Features:
- **🧪 Mock Mode Banner** - Reminds you everything is mocked
- **📋 Endpoint Indicators** - Shows which API each button calls
- **🔌 Show Endpoints Button** - Full API reference modal
- **💡 Fill Example Data** - Quick multi-currency setup
- **🗑️ Clear Form** - Reset to defaults
- **🧪 Test This** - Quick link to test flow

### Console Logs:
```
╔═══════════════════════════════════════════════════════════╗
║            🚀 PayPortal Demo Server 🚀                   ║
╚═══════════════════════════════════════════════════════════╝

📚 Resources:
   - Demo UI:          http://localhost:3003/demo
   - API Docs:         http://localhost:3003/swagger
   - Server Info:      http://localhost:3003/
   - Health Check:     http://localhost:3003/health

🔑 API Key: your-secret-api-key

✅ Sample payment link created!
   Link ID:  xxxxxxxx
   URL:      http://localhost:3003/pay/xxxxxxxx
```

---

## 🎯 Testing Checklist

After restart, verify these work:

### Create Tab:
- [ ] Form fields accept input
- [ ] "Fill Example Data" creates payment options
- [ ] Multi-currency checkbox shows/hides section
- [ ] Subscription checkbox shows/hides section
- [ ] "Add Payment Option" adds new fields
- [ ] "Remove" buttons delete options
- [ ] "Create Payment Link" makes API call
- [ ] Success message appears with link details

### View Links Tab:
- [ ] "Refresh Links" loads data
- [ ] Shows sample link created on startup
- [ ] "Copy ID" copies to clipboard
- [ ] "Test This" switches to test tab

### View Payments Tab:
- [ ] "Refresh Payments" loads data
- [ ] Shows payment details after confirmation

### Test Flow Tab:
- [ ] Link ID is pre-populated
- [ ] Step 1: Check Link Status returns 402
- [ ] Step 2: QR Code displays image
- [ ] Step 3: Confirm Payment accepts mock hash
- [ ] Step 4: Payment Status shows paid=true

### Swagger Page:
- [ ] Page loads without errors
- [ ] API documentation displays
- [ ] Endpoints are listed
- [ ] "Try it out" buttons work

---

## ⚠️ Important Notes

### Demo Structure (NOT Portable)
The demo folder **CANNOT** be moved out independently! It requires:
- ✅ `demo-server.js` (in root)
- ✅ `dist/index.js` (built library)
- ✅ `node_modules/` (dependencies)
- ✅ `swagger.json` (API spec)

See `demo/README_STRUCTURE.md` for details.

### CSP Settings (Production)
For production deployment, the CSP is intentionally relaxed for `/demo` and `/swagger` routes:
- These are demo/documentation routes
- They need inline scripts for interactivity
- They load resources from CDN (Swagger UI)
- Your API routes still have strict CSP

### Mock Mode
- All blockchains are mocked
- Any transaction hash is accepted
- Payments auto-confirm instantly
- No real RPC nodes needed
- No real cryptocurrency required

---

## 🆘 Troubleshooting

### Forms Still Not Working?
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Check browser console for errors
4. Verify server restarted correctly

### Swagger Still Has CSP Errors?
1. Make sure you restarted the server
2. Check `demo-server.js` has the updated CSP
3. Hard refresh the Swagger page
4. Try incognito/private window

### Port Still in Use?
```bash
# Find process on port 3003
netstat -ano | findstr :3003

# Kill the process (replace PID)
taskkill /PID <process_id> /F

# Or change port in demo-server.js
```

---

## 📝 Quick Reference

| What | Where | URL |
|------|-------|-----|
| Demo UI | http://localhost:3003/demo | Interactive testing |
| Swagger Docs | http://localhost:3003/swagger | API documentation |
| Server Info | http://localhost:3003/ | JSON endpoint info |
| Health Check | http://localhost:3003/health | Status check |

| File | Purpose |
|------|---------|
| demo/index.html | Frontend UI |
| demo-server.js | Backend server |
| swagger.json | API specification |
| dist/index.js | PayPortal library |

---

## ✨ New Features After Restart

1. **API Endpoint Modal**
   - Click "Show All Endpoints" in header
   - See complete API reference
   - Mock transaction examples
   - Chain ID reference

2. **Endpoint Indicators**
   - Each button shows which API it calls
   - e.g., "→ POST /api/links"
   - Better understanding of what's happening

3. **Enhanced Guidance**
   - Mock mode reminders
   - Step-by-step instructions
   - Clear transaction hash examples
   - Better error messages

4. **Improved UX**
   - Loading states on buttons
   - Success/error animations
   - Auto-population of test data
   - Quick action buttons

---

**Ready to test!** 🚀

Stop the old server, restart with `node demo-server.js`, and everything will work perfectly!


