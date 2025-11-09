# 📋 Mobile App - Quick Reference Card

## 🎯 File Checklist

Copy code from `MOBILE_APP_SCREENS.md` to these locations:

```
patient-mobile-app/
├── services/
│   ├── socket.ts         ← File 1 (CHANGE IP on line 3)
│   └── api.ts            ← File 2 (CHANGE IP on line 1)
├── screens/
│   ├── HomeScreen.tsx    ← File 3 (no changes)
│   ├── FAQScreen.tsx     ← File 4 (no changes)
│   └── ContactsScreen.tsx← File 5 (no changes)
└── App.tsx               ← File 6 (REPLACE entire file)
```

## 🔧 Setup Commands (Copy-Paste)

```bash
# 1. Create app
npx create-expo-app patient-mobile-app
cd patient-mobile-app

# 2. Install dependencies
npm install socket.io-client axios dayjs
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context expo-speech

# 3. Create folders
mkdir services
mkdir screens

# 4. Find your IP (Mac/Linux)
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for something like: 192.168.1.100

# 5. Create files and copy code from MOBILE_APP_SCREENS.md
# - services/socket.ts (File 1)
# - services/api.ts (File 2)
# - screens/HomeScreen.tsx (File 3)
# - screens/FAQScreen.tsx (File 4)
# - screens/ContactsScreen.tsx (File 5)
# - App.tsx (File 6 - replace existing)

# 6. Update IP addresses in:
# - services/socket.ts line 3
# - services/api.ts line 1
# Replace with YOUR IP (like 192.168.1.100)

# 7. Run!
npx expo start
```

## ⚡ Quick Test

1. **Backend running?** → Check http://localhost:5001
2. **Dashboard open?** → Go to http://localhost:5173
3. **Mobile app?** → `npx expo start` → Scan QR code
4. **Test sync**: Add FAQ in dashboard → See it appear on phone!

## 🔑 Important IP Addresses

| Service | URL | Used By |
|---------|-----|---------|
| Backend API | `http://YOUR_IP:5001` | Mobile app |
| Dashboard | `http://localhost:5173` | You (computer) |
| Socket.IO | `ws://YOUR_IP:5001` | Real-time sync |

**Remember:** 
- `localhost` only works on same device
- `YOUR_IP` (like 192.168.1.100) works across WiFi network
- Phone must be on same WiFi as your computer!

## 📱 After Running

You should see in app console:
- ✅ "Connected to server"
- ✅ "Joined room for patient 1"

If not, check:
- IP addresses in socket.ts and api.ts
- Backend is running
- Same WiFi network

## 🎉 Success Looks Like:

- Home screen loads with time and greeting
- FAQ tab shows questions from dashboard  
- Contacts tab shows emergency contacts
- Adding FAQ in dashboard → appears instantly on phone!
- Sending urgent message → alert pops up on phone!

**That's real-time sync! 🚀**

---

**Need help?** Check `MOBILE_APP_SCREENS.md` for detailed instructions!
