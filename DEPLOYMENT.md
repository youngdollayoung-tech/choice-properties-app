# Choice Properties - Deployment Guide

## 🚀 Production Deployment Checklist

### Phase 1: Google Apps Script Setup

1. **Create New GAS Project**
   - Go to [script.google.com](https://script.google.com)
   - Create new project: "Choice Properties Backend"
   - Copy entire `backend/code.gs` content into the script editor

2. **Configure Production Settings**
   - Update `ALLOWED_ORIGINS` array in `code.gs`:
     ```javascript
     const ALLOWED_ORIGINS = [
       'https://your-cloudflare-pages-url.pages.dev', // Your actual Cloudflare URL
       'https://choice-properties-app.yourdomain.com', // Your custom domain
       'https://script.google.com'
     ];
     ```

3. **Deploy as Web App**
   - Click "Deploy" > "New deployment"
   - Type: "Web app"
   - Description: "Choice Properties Production"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - **Copy the deployment URL** - this is your `SCRIPT_ID`

4. **Update Frontend URL**
   - In `js/script.js`, replace `YOUR_SCRIPT_ID` with your actual deployment ID:
     ```javascript
     this.BACKEND_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec';
     ```

### Phase 2: Cloudflare Pages Setup

1. **Create Cloudflare Account**
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Add your domain (optional for testing)

2. **Deploy to Pages**
   - Go to Cloudflare Dashboard > Pages
   - Click "Create a project"
   - Connect to your GitHub repository
   - Build settings:
     - Build command: (leave empty)
     - Build output directory: `/` (root)
     - Root directory: `/workspaces/choice-properties-app`

3. **Update CORS Origins**
   - After deployment, update `ALLOWED_ORIGINS` in GAS with your Pages URL

### Phase 3: Properties Setup

1. **Initialize Properties Sheet**
   - Run the GAS script once to create sheets
   - Add sample properties to the "Properties" sheet:
     ```
     PropertyID | State | Address | City | Zip | Rent | Deposit | Fees | LeaseTemplateURL | OwnerEmail | CustomCSS | PetPolicy | SmokingPolicy | UtilitiesIncluded | ParkingFee | ApplicationFee
     PROP001 | CA | 123 Main St | Los Angeles | 90001 | 1200 | 2400 | 50 | https://example.com/lease.pdf | landlord@example.com |  | Pets Allowed | No Smoking | Water, Trash | 100 | 25
     ```

2. **Test Widget Generator**
   - Open `widget-generator.html` locally
   - Generate embed codes for your properties
   - Test iframe embedding

### Phase 4: Admin Configuration

1. **Set Admin Emails**
   - In GAS, go to "Settings" sheet
   - Update "AdminEmails" cell with authorized admin emails:
     ```
     choicepropertygroup@hotmail.com,theapprovalh@gmail.com,jamesdouglaspallock@gmail.com
     ```

2. **Test Admin Access**
   - Visit: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=admin`
   - Login with authorized Google account

### Phase 5: Testing & Validation

1. **End-to-End Test**
   - Submit a test application
   - Check admin dashboard for new application
   - Test approval workflow
   - Test lease generation and signing

2. **Embed Testing**
   - Create test HTML page with iframe
   - Verify property data pre-fills
   - Test form submission from embed

3. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari, Edge
   - Verify mobile responsiveness

### Phase 6: Go-Live Preparation

1. **Backup Strategy**
   - Set up Google Sheets backups
   - Document recovery procedures

2. **Monitoring Setup**
   - Enable GAS execution logs
   - Set up error notifications

3. **Support Documentation**
   - Create landlord onboarding guide
   - Document admin workflows
   - Prepare FAQ for applicants

## 🔧 Troubleshooting

### Common Issues

**403 CORS Error:**
- Check `ALLOWED_ORIGINS` includes your domain
- Verify GAS deployment permissions

**Form Not Loading:**
- Confirm `BACKEND_URL` is correct in `script.js`
- Check GAS script is deployed and accessible

**Admin Access Denied:**
- Verify email is in "AdminEmails" setting
- Check Google account permissions

**Embed Not Working:**
- Ensure iframe `src` points to correct GAS URL with `?path=embed&propertyId=XXX`
- Check property exists in Properties sheet

## 📞 Support

- **Technical Issues:** Check GAS execution logs
- **Deployment Help:** Review this guide step-by-step
- **Business Logic:** Contact development team

## ✅ Success Checklist

- [ ] GAS script deployed with correct permissions
- [ ] Frontend deployed to Cloudflare Pages
- [ ] CORS origins configured
- [ ] Properties sheet populated
- [ ] Admin emails configured
- [ ] Test application submitted successfully
- [ ] Admin dashboard accessible
- [ ] Embed widget working
- [ ] All URLs updated in configuration

**Status:** Ready for production deployment! 🎉