# Claude Code Meno Frontend

Next.js monorepo frontend for the Metiscore Health Platform with enhanced security and compliance features.

## Features
- Menopause wellness tracking app
- Partner support dashboard
- Real-time journal sharing
- Consent management system
- Multi-jurisdictional compliance (HIPAA/PIPEDA/GDPR)

## Development
```bash
pnpm install
pnpm dev
```

## Environment Variables

### Frontend Apps Configuration
Copy the template files and update with your values:

**For MenoWellness app:**
```bash
cp apps/meno-wellness/.env.local.template apps/meno-wellness/.env.local
```

**For Partner Support app:**
```bash
cp apps/partner-support/.env.local.template apps/partner-support/.env.local
```

### Backend Configuration
```bash
cp backend/.env.template backend/.env
```

### Required Firebase Configuration
Update the following in both app `.env.local` files:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=claude-code-meno-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=claude-code-meno-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=claude-code-meno-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SENTIMENT_API_URL=https://www.sentimentasaservice.com/api/analyze
```

### Google Cloud KMS Setup
The application uses Google Cloud KMS for enterprise-grade key management:

**KMS Configuration:**
- **Location**: `northamerica-northeast2` (Canadian region for PIPEDA/PHIPA compliance)
- **Key Ring**: `app-backend-meno-apps`
- **Keys**:
  - `meno-app-encryption-key` (for MenoWellness app)
  - `support-partner-app-encryption-key` (for Partner Support app)

**Service Account Setup (for local development):**
1. Create a service account in Google Cloud Console
2. Grant it `Cloud KMS CryptoKey Encrypter/Decrypter` role
3. Download the JSON key file
4. Set `GOOGLE_APPLICATION_CREDENTIALS` in `backend/.env`

