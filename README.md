# 🚌 Altaviapp - School Transport Management Platform

> **SaaS platform for comprehensive school transport management with real-time tracking, safety controls, and automated parent communication.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/altaviapp/altaviapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRD](https://img.shields.io/badge/PRD-Complete-success.svg)](docs/PRD.md)
[![Database Schema](https://img.shields.io/badge/Schema-Documented-orange.svg)](docs/database/DATABASE_SCHEMA.md)

## 🎯 **Overview**

Altaviapp is a comprehensive SaaS platform designed specifically for educational institutions to manage their school transport operations. The platform provides real-time GPS tracking, automated safety controls, instant parent notifications via WhatsApp, and complete fleet management capabilities.

### **Key Features**
- 🗺️ **Real-time GPS Tracking** - Live vehicle location with parent portal access
- 📱 **Driver Mobile App (PWA)** - Offline-capable app for route management and student check-ins
- 👨‍👩‍👧 **Parent Portal** - Real-time tracking with automated WhatsApp notifications
- 👨‍💼 **Admin Dashboard** - Complete fleet, route, and student management
- 🔍 **QR Code System** - Secure student identification and boarding control
- 📊 **Analytics & Reporting** - Comprehensive insights and operational metrics
- 🛡️ **Safety Controls** - Geofencing, emergency alerts, and incident reporting

---

## 🛠️ **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | [Bubble.io](https://bubble.io) | Visual development platform for admin dashboard and parent portal |
| **Database** | [Convex](https://convex.dev) | Real-time database with live queries and serverless functions |
| **Authentication** | [Clerk](https://clerk.dev) | User management and role-based access control |
| **Maps** | [OpenStreetMap](https://openstreetmap.org) + [Leaflet](https://leafletjs.com) | Open-source mapping and routing |
| **Mobile** | Progressive Web App (PWA) | Cross-platform mobile application for drivers |
| **Notifications** | [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp) | Automated parent notifications |
| **QR Codes** | [qrcode.js](https://github.com/davidshimjs/qrcode) | Student identification system |

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Convex account
- Clerk account
- Bubble.io account (for admin interface)

### **1. Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/altaviapp/altaviapp.git
cd altaviapp

# Run setup script
chmod +x scripts/setup-altaviapp-repo.sh
./scripts/setup-altaviapp-repo.sh

# Install dependencies
npm install
```

### **2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
# - Convex deployment URL
# - Clerk authentication keys
# - WhatsApp API credentials
# - Bubble.io API endpoints
```

### **3. Database Setup**
```bash
# Initialize Convex
npx convex dev

# This will:
# - Create your Convex deployment
# - Set up the database schema
# - Start the development server
```

### **4. Start Development**
```bash
# Start the development server
npm run dev

# The driver PWA will be available at:
# http://localhost:3000/driver
```

---

## 📁 **Project Structure**

```
altaviapp-platform/
├── 📁 docs/                    # Documentation
│   ├── 📄 PRD.md              # Product Requirements Document
│   ├── 📁 database/           # Database documentation
│   ├── 📁 api/                # API documentation
│   └── 📁 user-guides/        # User manuals
├── 📁 frontend/               # Bubble.io integration
│   ├── 📁 pages/              # Page definitions
│   ├── 📁 workflows/          # Business logic workflows
│   └── 📁 api-endpoints/      # External API integrations
├── 📁 backend/                # Convex backend
│   ├── 📁 convex/             # Database schema and functions
│   ├── 📁 functions/          # Server-side logic
│   └── 📁 auth/               # Authentication helpers
├── 📁 mobile/                 # PWA Driver App
│   ├── 📁 src/                # React PWA source code
│   ├── 📁 public/             # Static assets
│   └── 📄 manifest.json       # PWA configuration
├── 📁 scripts/                # Automation scripts
│   ├── 📄 deployment/         # CI/CD scripts
│   └── 📄 data-migration/     # Database migration tools
└── 📁 tests/                  # Test suites
    ├── 📁 unit/               # Unit tests
    ├── 📁 integration/        # API integration tests
    └── 📁 e2e/                # End-to-end tests
```

---

## 🏗️ **Architecture Overview**

```mermaid
graph TB
    A[Bubble.io Admin Dashboard] --> D[Convex Database]
    B[PWA Driver App] --> D
    C[Parent Portal] --> D
    D --> E[Clerk Authentication]
    D --> F[WhatsApp API]
    D --> G[OpenStreetMap]
    
    subgraph "Frontend Layer"
        A
        B
        C
    end
    
    subgraph "Backend Layer"
        D
        E
    end
    
    subgraph "External Services"
        F
        G
    end
```

### **Data Flow**
1. **Real-time GPS**: Driver app → Convex → Parent portal (live updates)
2. **Student Check-ins**: QR scan → Convex → WhatsApp notification → Parent
3. **Route Management**: Admin dashboard → Convex → Driver app sync
4. **Analytics**: All interactions → Convex → Dashboard reporting

---

## 🎮 **User Roles & Access**

| Role | Platform | Key Features |
|------|----------|--------------|
| **Super Admin** | Bubble.io Dashboard | System-wide management, analytics, customer support |
| **School Admin** | Bubble.io Dashboard | Fleet management, route planning, student enrollment |
| **Driver** | PWA Mobile App | GPS tracking, student check-ins, incident reporting |
| **Parent** | Responsive Web Portal | Real-time tracking, notifications, student history |

---

## 🔧 **Development Workflow**

### **Backend Development (Convex)**
```bash
# Start Convex development server
npx convex dev

# Deploy functions
npx convex deploy

# View database dashboard
npx convex dashboard
```

### **Frontend Development (PWA)**
```bash
# Start React development server
cd mobile
npm run dev

# Build for production
npm run build

# Test PWA offline functionality
npm run serve
```

### **Testing**
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode for development
npm run test:watch
```

---

## 📊 **Key Features Deep Dive**

### **🗺️ Real-time GPS Tracking**
- **Technology**: WebRTC + Convex live queries
- **Update Frequency**: Every 15 seconds
- **Accuracy**: ±10 meters
- **Offline Support**: Data cached locally, synced when online

### **📱 Driver PWA App**
- **Installation**: One-click install on mobile devices
- **Offline Mode**: Full functionality without internet
- **Features**: Route navigation, student check-ins, emergency alerts
- **Performance**: <3 second load time, <1 second QR scan

### **👨‍👩‍👧 Parent Experience**
- **Real-time Map**: Live vehicle location with ETA
- **WhatsApp Integration**: Automated pickup/dropoff notifications
- **History**: Complete trip history and attendance tracking
- **Multi-language**: Spanish and English support

### **🛡️ Safety & Security**
- **QR Authentication**: Unique codes per student
- **Geofencing**: Automatic stop detection
- **Emergency Button**: One-tap emergency alert system
- **Data Encryption**: End-to-end encryption for all communications

---

## 🌍 **Deployment**

### **Development Environment**
```bash
# Local development
npm run dev

# Access points:
# - Driver PWA: http://localhost:3000/driver
# - Parent Portal: http://localhost:3000/parent
# - API Documentation: http://localhost:3000/api/docs
```

### **Staging Environment**
- **URL**: https://staging.altaviapp.app
- **Convex**: Staging deployment
- **Clerk**: Development instance
- **WhatsApp**: Sandbox environment

### **Production Environment**
- **URL**: https://app.altaviapp.com
- **Convex**: Production deployment with backup
- **Clerk**: Production instance with MFA
- **WhatsApp**: Business API with verified numbers
- **Monitoring**: 24/7 uptime monitoring with alerts

### **CI/CD Pipeline**
```yaml
# Automated deployment on main branch
- Code quality checks (ESLint, TypeScript)
- Unit and integration tests
- Security vulnerability scanning
- Automated Convex deployment
- PWA build and deployment to CDN
- Staging environment testing
- Production deployment approval
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
```bash
# Example: Testing student check-in function
describe('Student Check-in', () => {
  test('should validate QR code and record check-in', async () => {
    const result = await checkInStudent({
      qrCode: 'valid-qr-code',
      tripId: 'trip-123',
      location: { lat: -0.1807, lng: -78.4678 }
    });
    
    expect(result.success).toBe(true);
    expect(result.student).toBeDefined();
  });
});
```

### **Integration Tests**
- **API Endpoints**: All Convex functions tested with real data
- **Authentication**: Clerk integration validation
- **External APIs**: WhatsApp and maps service integration
- **Database**: Schema validation and data integrity

### **E2E Tests**
- **Driver Workflow**: Complete route execution simulation
- **Parent Experience**: Real-time tracking and notifications
- **Admin Operations**: Fleet and student management workflows

---

## 📈 **Performance Metrics**

### **Current Benchmarks**
- **GPS Update Latency**: <500ms average
- **QR Scan Speed**: <1 second
- **Map Load Time**: <2 seconds
- **Offline Sync**: <5 seconds after reconnection
- **WhatsApp Delivery**: <10 seconds average

### **Scalability Targets**
- **Concurrent Users**: 10,000+ simultaneous
- **GPS Updates**: 1,000+ per second
- **Database Operations**: 50,000+ queries per minute
- **Storage**: 1TB+ location data per year

---

## 🔒 **Security & Privacy**

### **Data Protection**
- **Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit
- **Authentication**: JWT tokens with automatic refresh
- **Authorization**: Role-based access control (RBAC)
- **Privacy**: GDPR compliant with data retention policies

### **Security Features**
- **Input Validation**: All inputs sanitized and validated
- **SQL Injection**: Protected via Convex parameterized queries
- **XSS Prevention**: Content Security Policy (CSP) headers
- **Rate Limiting**: API abuse prevention
- **Audit Logging**: Complete action audit trail

---

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Run tests: `npm test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open Pull Request

### **Code Standards**
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic code formatting
- **Testing**: Minimum 80% code coverage
- **Documentation**: JSDoc for all public functions

### **Commit Convention**
```
feat: add GPS tracking optimization
fix: resolve QR scanner camera permission issue
docs: update API documentation
test: add unit tests for student check-in
refactor: improve database query performance
```

---

## 📞 **Support & Documentation**

### **Documentation**
- 📚 **[Product Requirements](docs/PRD.md)** - Complete feature specifications
- 🗄️ **[Database Schema](docs/database/DATABASE_SCHEMA.md)** - Data model documentation
- 🔌 **[API Reference](docs/api/)** - Convex functions documentation
- 👥 **[User Guides](docs/user-guides/)** - End-user documentation

### **Community & Support**
- 💬 **Discord**: [Join our community](https://discord.gg/altaviapp)
- 🐛 **Issues**: [Report bugs](https://github.com/altaviapp/altaviapp/issues)
- 💡 **Feature Requests**: [Request features](https://github.com/altaviapp/altaviapp/discussions)
- 📧 **Email**: support@altaviapp.com

### **Commercial Support**
- 🏢 **Enterprise**: Dedicated support and custom features
- 🎓 **Implementation**: Professional setup and training
- 🔧 **Maintenance**: Ongoing updates and monitoring
- 📞 **Contact**: sales@altaviapp.com

---

## 🗺️ **Roadmap**

### **Version 1.0 (Current)** ✅
- Core GPS tracking and route management
- Driver PWA with offline support
- Parent portal with WhatsApp notifications
- Admin dashboard with basic analytics
- QR code student identification

### **Version 1.1 (Q1 2025)** 🔄
- Advanced analytics and reporting
- Multi-language support (Spanish/English)
- Enhanced offline capabilities
- Driver performance metrics
- Parent satisfaction surveys

### **Version 1.2 (Q2 2025)** 📋
- AI-powered route optimization
- Predictive maintenance alerts
- Advanced geofencing features
- Integration with school management systems
- Mobile app for parents (native iOS/Android)

### **Version 2.0 (Q3 2025)** 🚀
- Multi-tenant architecture for school districts
- Advanced AI for traffic prediction
- IoT sensor integration (fuel, temperature)
- Comprehensive safety scoring system
- API for third-party integrations

---

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2025 Altaviapp

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 **Acknowledgments**

- **[Convex](https://convex.dev)** - For the amazing real-time database platform
- **[Clerk](https://clerk.dev)** - For seamless authentication solutions
- **[OpenStreetMap](https://openstreetmap.org)** - For free and open mapping data
- **[Leaflet](https://leafletjs.com)** - For the lightweight mapping library
- **Contributors** - Thanks to all the developers who have contributed to this project

---

## 📊 **Project Stats**

![GitHub stars](https://img.shields.io/github/stars/altaviapp/altaviapp?style=social)
![GitHub forks](https://img.shields.io/github/forks/altaviapp/altaviapp?style=social)
![GitHub issues](https://img.shields.io/github/issues/altaviapp/altaviapp)
![GitHub pull requests](https://img.shields.io/github/issues-pr/altaviapp/altaviapp)
![GitHub last commit](https://img.shields.io/github/last-commit/altaviapp/altaviapp)

---

**Made with ❤️ by [Altaviapp](https://altaviapp.com) - Revolutionizing school transport management in Latin America** 🚌✨