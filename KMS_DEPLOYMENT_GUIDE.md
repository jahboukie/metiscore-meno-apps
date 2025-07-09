# 🔐 Google Cloud KMS Deployment Guide
## MenoWellness & Partner Support Healthcare Applications

### 📋 **Overview**
This guide documents the complete deployment process for Google Cloud KMS integration in the MenoWellness healthcare application ecosystem, ensuring HIPAA, PIPEDA, PHIPA, and GDPR compliance.

---

## 🏗️ **Architecture Summary**

### **Multi-App KMS Structure**
- **Location**: `northamerica-northeast2` (Canadian region for PIPEDA/PHIPA compliance)
- **Key Ring**: `app-backend-meno-apps`
- **Keys**: 
  - `meno-app-encryption-key` (MenoWellness app)
  - `support-partner-app-encryption-key` (Partner Support app)

### **Security Model**
- **Hybrid Encryption**: KMS-protected Data Encryption Keys (DEKs) + client-side AES-256-GCM
- **Zero-Trust Architecture**: Data encrypted client-side before transmission
- **Hardware Security**: Keys protected by Google's HSMs
- **Compliance Ready**: Meets healthcare regulatory requirements

---

## 🚀 **Deployment Steps**

### **1. Environment Configuration**

#### **Frontend Apps (.env.local)**
```bash
# MenoWellness App
cp apps/meno-wellness/.env.local.template apps/meno-wellness/.env.local

# Partner Support App  
cp apps/partner-support/.env.local.template apps/partner-support/.env.local
```

**Required Variables:**
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCibsU2ocLq8PAmXBkNjJespnI43Uh2bkQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=claude-code-meno-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=claude-code-meno-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=claude-code-meno-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=967128145825
NEXT_PUBLIC_FIREBASE_APP_ID=1:967128145825:web:86466460bcbf57b7c775e0

# KMS Configuration (App-specific)
NEXT_PUBLIC_APP_TYPE=meno-wellness  # or partner-support
NEXT_PUBLIC_KMS_KEY_NAME=meno-app-encryption-key  # or support-partner-app-encryption-key
NEXT_PUBLIC_KMS_ENABLED=true
NEXT_PUBLIC_KMS_HYBRID_MODE=true
```

#### **Backend Configuration (.env)**
```bash
cp backend/.env.template backend/.env
```

**Required Variables:**
```env
# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT=claude-code-meno-app

# Google Cloud KMS Configuration
GOOGLE_CLOUD_KMS_LOCATION=northamerica-northeast2
GOOGLE_CLOUD_KMS_KEYRING=app-backend-meno-apps
MENO_WELLNESS_KMS_KEY=meno-app-encryption-key
PARTNER_SUPPORT_KMS_KEY=support-partner-app-encryption-key

# Service Account Configuration (for local development)
GOOGLE_APPLICATION_CREDENTIALS=../keys/claude-code-meno-app-e7cf3f2bad44.json
```

### **2. Service Account Setup**

#### **Create Service Account**
1. **Google Cloud Console** → **IAM & Admin** → **Service Accounts**
2. **Create Service Account**: `meno-kms-dev-service`
3. **Grant Roles**:
   - `Cloud KMS CryptoKey Encrypter/Decrypter`
   - `Cloud KMS Viewer` (optional)
4. **Download JSON Key** → Save as `keys/claude-code-meno-app-e7cf3f2bad44.json`

#### **Test Service Account**
```bash
# Activate service account
gcloud auth activate-service-account --key-file=keys/claude-code-meno-app-e7cf3f2bad44.json

# Test KMS access
cd backend
$env:GOOGLE_APPLICATION_CREDENTIALS="../keys/claude-code-meno-app-e7cf3f2bad44.json"
node test-kms.js
```

**Expected Output:**
```
🎉 All KMS tests PASSED!
✅ KMS integration is working correctly
```

### **3. Build & Deploy**

#### **TypeScript Validation**
```bash
# Validate all packages
pnpm run typecheck
```

#### **Backend Build**
```bash
cd backend
pnpm run build
```

#### **Firebase Functions Deployment**
```bash
# Set environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS="../keys/claude-code-meno-app-e7cf3f2bad44.json"

# Deploy functions
firebase deploy --only functions
```

---

## 🧪 **Testing & Validation**

### **KMS Functionality Test**
```bash
cd backend
$env:GOOGLE_APPLICATION_CREDENTIALS="../keys/claude-code-meno-app-e7cf3f2bad44.json"
node test-kms.js
```

### **Frontend App Testing**
```bash
# Test MenoWellness app
cd apps/meno-wellness
pnpm run dev

# Test Partner Support app  
cd apps/partner-support
pnpm run dev
```

### **Key Manager UI Testing**
1. **Navigate to Profile Page** in either app
2. **Verify KMS Status Display**:
   - Status: "KMS Available" 
   - Security Level: "Hardware Protected"
   - Region: "northamerica-northeast2"
3. **Test Key Rotation** functionality

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Authentication Errors**
```
Error: Could not load the default credentials
```
**Solution:**
- Verify service account key path in `backend/.env`
- Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS`
- Check service account permissions

#### **2. KMS Access Denied**
```
Error: Permission denied on KMS key
```
**Solution:**
- Verify service account has `Cloud KMS CryptoKey Encrypter/Decrypter` role
- Check key names match configuration
- Confirm location is `northamerica-northeast2`

#### **3. TypeScript Errors**
```
Error: Cannot find module '@metiscore/ui'
```
**Solution:**
```bash
pnpm install
pnpm run typecheck
```

#### **4. Firebase Deployment Hanging**
**Solution:**
- Check Firebase project selection: `firebase use claude-code-meno-app`
- Verify authentication: `firebase login`
- Try deploying individual functions

### **Validation Checklist**
- [ ] Environment files configured
- [ ] Service account created and key downloaded
- [ ] KMS test passes
- [ ] TypeScript validation passes
- [ ] Backend builds successfully
- [ ] Firebase Functions deploy successfully
- [ ] Frontend apps start without errors
- [ ] Key Manager UI shows KMS status correctly

---

## 📚 **Additional Resources**

### **File Structure**
```
meno-app/
├── apps/
│   ├── meno-wellness/.env.local
│   └── partner-support/.env.local
├── backend/
│   ├── .env
│   ├── src/kms-service.ts
│   └── test-kms.js
├── keys/
│   └── claude-code-meno-app-e7cf3f2bad44.json
└── shared/ui/src/
    ├── security-utils.ts
    └── KeyManager.tsx
```

### **Key Components**
- **KMSService**: Backend service for key operations
- **SecurityUtils**: Enhanced with KMS integration
- **KeyManager**: UI component with KMS status
- **Firebase Functions**: Cloud Functions for secure key operations

### **Compliance Notes**
- **Data Residency**: Canadian region (`northamerica-northeast2`)
- **Encryption**: AES-256-GCM with hardware-protected keys
- **Audit Trail**: Complete logging of key operations
- **Access Control**: Role-based service account permissions

---

## 🎯 **Next Steps**
1. **Production Deployment**: Configure production service accounts
2. **Monitoring**: Set up Cloud Monitoring for KMS operations
3. **Key Rotation**: Implement automated key rotation schedule
4. **Backup Strategy**: Document key backup and recovery procedures
5. **Security Audit**: Regular security reviews and penetration testing
