# Frontend Environment & Deployment Guide

## 🔧 Development Setup

### Prerequisites

- Node.js v18+ 
- npm v9+
- Git

### Installation Steps

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Configure environment variables
# Edit .env with your values
```

### Environment Variables

```env
# API Gateway URL (Main entry point for all services)
VITE_API_URL=http://localhost:5000/api

# WebSocket for real-time features
VITE_SOCKET_URL=http://localhost:5000

# Authentication
VITE_JWT_STORAGE_KEY=smarthealthcareToken
VITE_JWT_EXPIRY=7d

# Frontend configuration
VITE_APP_NAME=Smart Healthcare Platform
VITE_FRONTEND_URL=http://localhost:5173

# Consultation (Jitsi Meet)
VITE_JITSI_DOMAIN=meet.jit.si
VITE_JITSI_ROOM_PASSWORD=

# Payment Gateway (PayHere)
VITE_PAYHERE_MERCHANT_ID=1235180
VITE_PAYHERE_SANDBOX=true

# Analytics (Optional)
VITE_ANALYTICS_ID=

# Feature Flags
VITE_ENABLE_SYMPTOM_CHECKER=true
VITE_ENABLE_CONSULTATION=true
VITE_ENABLE_PAYMENTS=true
```

## 🚀 Running Development Server

```bash
# Start development server with hot reload
npm run dev

# Server will run on http://localhost:5173
```

## 📦 Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Build output will be in dist/ directory
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📊 Linting & Formatting

```bash
# Lint JavaScript files
npm run lint

# Format code with Prettier
npm run format

# Fix linting errors
npm run lint:fix
```

## 🔗 API Gateway Configuration

Ensure API Gateway is running on port 5000 with all service routes configured:

```
API Gateway (5000)
├── /api/auth → Auth Service (5001)
├── /api/patients → Patient Service (5002)
├── /api/appointments → Appointment Service (5003)
├── /api/consultations → Consultation Service (5004)
├── /api/payments → Payment Service (5005)
├── /api/doctors → Doctor Service (5006)
├── /api/symptom-checker → Symptom Checker Service (5007)
└── /api/notifications → Notification Service (5008)
```

## 🐛 Debugging

### Browser DevTools

1. Open Chrome DevTools (F12)
2. Use Console, Sources, and Network tabs
3. Install React DevTools extension

### VS Code Debugging

Install launch configuration in `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src",
      "sourceMapPathOverride": {
        "/src/*": "${webRoot}/*"
      }
    }
  ]
}
```

## 🚨 Common Issues & Solutions

### Issue: Module not found errors

```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 5173 already in use

```bash
# Solution: Change port in vite.config.js
export default {
  server: {
    port: 5174
  }
}
```

### Issue: API Gateway connection errors

1. Check if API Gateway is running on port 5000
2. Verify `VITE_API_URL` environment variable
3. Check CORS configuration on API Gateway

### Issue: CORS errors

Add proxy configuration in `vite.config.js`:

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
}
```

## 📤 Deployment

### Docker Deployment

**Dockerfile** (in frontend directory):

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and run:

```bash
docker build -t smart-healthcare-frontend .

docker run -p 3000:3000 smart-healthcare-frontend
```

### Nginx Deployment

**nginx.conf**:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # Redirect all routes to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to API Gateway
    location /api/ {
        proxy_pass http://api-gateway:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### AWS S3 + CloudFront Deployment

```bash
# Build the application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## 📈 Performance Optimization

### 1. Code Splitting

```javascript
// pages/DoctorListPage.jsx
import { lazy, Suspense } from "react";

const DoctorList = lazy(() => import("../components/DoctorList"));

function DoctorListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DoctorList />
    </Suspense>
  );
}
```

### 2. Image Optimization

```javascript
// Use responsive images
<img 
  src="doctor.webp" 
  alt="Doctor" 
  loading="lazy"
  srcSet="doctor-small.webp 480w, doctor.webp 1200w"
/>
```

### 3. Bundle Analysis

```bash
# Install analyzer
npm install --save-dev vite-plugin-visualizer

# Run analyzer
npm run build
```

### 4. Performance Metrics

Monitor with Lighthouse:
1. Open DevTools
2. Go to Lighthouse tab
3. Run audits
4. Target scores: 90+ for all categories

## 🔐 Security

### 1. Environment Variables

- Never commit `.env` files
- Use `.env.example` as template
- Rotate sensitive keys regularly

### 2. HTTPS

Always use HTTPS in production:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
}
```

### 3. Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">
```

### 4. CORS Headers

Configure on API Gateway:

```javascript
cors: {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}
```

## 📊 Monitoring & Analytics

### Setup Error Tracking (Sentry)

```bash
npm install @sentry/react

# Initialize in main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Setup Analytics (Google Analytics)

```bash
npm install react-ga4

# Initialize in App.jsx
import ReactGA from "react-ga4";

ReactGA.initialize("GA_MEASUREMENT_ID");
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml**:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to S3
        run: aws s3 sync dist/ s3://${{ secrets.AWS_BUCKET }}
```

## 📚 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

## 🆘 Getting Help

### Documentation
- Vite: https://vitejs.dev
- React: https://react.dev
- React Router: https://reactrouter.com

### Troubleshooting
1. Check console errors
2. Verify environment variables
3. Check API Gateway logs
4. Review component state with DevTools

---

**Version**: 1.0.0  
**Last Updated**: April 2026
