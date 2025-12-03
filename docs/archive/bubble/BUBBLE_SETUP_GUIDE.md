# Bubble.io Setup Guide for Altaviapp

**Non-Technical Guide for Connecting Bubble to Altaviapp Backend**
**Version**: 1.0
**Date**: January 2025

---

## Overview

This guide will help you connect your Bubble.io application to the Altaviapp backend API. No coding knowledge required! Follow these steps to set up the admin dashboard and parent portal.

**What you'll set up:**
- Clerk Authentication plugin
- API Connector to Altaviapp backend
- API calls for vehicles, students, routes, trips, and tracking
- Basic pages and workflows

---

## Prerequisites

Before starting, make sure you have:
- [ ] Bubble.io account created
- [ ] Altaviapp Bubble app created (or create new app)
- [ ] Backend API URL (provided by developer)
- [ ] Clerk API keys (provided by developer)

---

## Part 1: Install Clerk Authentication Plugin

### Step 1: Open Plugins Tab
1. In your Bubble editor, click on **Plugins** in the left sidebar
2. Click **Add plugins** button

### Step 2: Search for Clerk
1. In the plugin marketplace search bar, type "**Clerk**"
2. Find the **Clerk** plugin (official plugin)
3. Click **Install** button

### Step 3: Configure Clerk Keys
1. After installation, the Clerk plugin will appear in your plugins list
2. Click on the **Clerk** plugin to open settings
3. You'll see two fields:
   - **Publishable Key**: Paste the key provided by your developer (starts with `pk_`)
   - **Secret Key**: Paste the secret key provided by your developer (starts with `sk_`)
4. Click **Save**

### Step 4: Add Clerk Elements to Your Page
1. Go to your login/signup page in the Bubble editor
2. From the **Visual Elements** panel, you'll now see **Clerk** elements
3. Drag the **Clerk Sign In** element to your login page
4. Drag the **Clerk Sign Up** element to your signup page
5. Configure redirect URLs:
   - After sign in: `/dashboard`
   - After sign up: `/dashboard`

✅ **Clerk is now set up!** Users can sign in and create accounts.

---

## Part 2: Set Up API Connector

### Step 1: Install API Connector Plugin
1. Go to **Plugins** tab
2. Click **Add plugins**
3. Search for "**API Connector**"
4. Click **Install** on the API Connector plugin (by Bubble)

### Step 2: Add Altaviapp API
1. Click on **API Connector** in your plugins list
2. Click **Add another API** button
3. Configure the API:
   - **API Name**: `Altaviapp Backend`
   - Leave other settings as default
4. Click **Add shared headers**:
   - **Key**: `Content-Type`
   - **Value**: `application/json`
5. Click **Add shared headers** again:
   - **Key**: `Authorization`
   - **Value**: Leave empty for now (we'll use dynamic auth)

### Step 3: Configure Authentication
1. In the API Connector settings for "Altaviapp Backend"
2. Under **Authentication**, select **Private key in header**
3. Configure:
   - **Header name**: `Authorization`
   - **Header value**: `Bearer [token]` (literally type this, we'll make it dynamic later)

✅ **API Connector is configured!**

---

## Part 3: Create API Calls

Now we'll create API calls for each feature. **Developer note**: Replace `https://api.altaviapp.com/api/v1` with your actual API URL.

### API Call 1: Get Vehicles

1. In API Connector, under "Altaviapp Backend", click **Add another call**
2. Configure:
   - **Name**: `GetVehicles`
   - **Use as**: Data
   - **Data type**: JSON
   - **Method**: GET
   - **URL**: `https://api.altaviapp.com/api/v1/vehicles`
3. Click **Initialize call**
4. Bubble will show you a preview of the data structure
5. Click **Save**

### API Call 2: Create Vehicle

1. Click **Add another call**
2. Configure:
   - **Name**: `CreateVehicle`
   - **Use as**: Action
   - **Data type**: JSON
   - **Method**: POST
   - **URL**: `https://api.altaviapp.com/api/v1/vehicles`
3. Click **Add parameter**:
   - **Key**: `licensePlate`
   - **Value**: `ABC-123` (example value)
   - **Private**: unchecked
   - **Optional**: unchecked
4. Repeat "Add parameter" for:
   - `brand` (value: `Toyota`)
   - `model` (value: `Hiace`)
   - `year` (value: `2023`)
   - `capacity` (value: `15`)
   - `color` (value: `Blanco`)
5. Click **Initialize call**
6. Click **Save**

### API Call 3: Get Students

1. Click **Add another call**
2. Configure:
   - **Name**: `GetStudents`
   - **Use as**: Data
   - **Method**: GET
   - **URL**: `https://api.altaviapp.com/api/v1/students`
3. Initialize and save

### API Call 4: Create Student

1. Click **Add another call**
2. Configure:
   - **Name**: `CreateStudent`
   - **Use as**: Action
   - **Method**: POST
   - **URL**: `https://api.altaviapp.com/api/v1/students`
3. Add parameters:
   - `firstName` (value: `Juan`)
   - `lastName` (value: `Pérez`)
   - `grade` (value: `5to Grado`)
   - `parentName` (value: `María Pérez`)
   - `parentPhone` (value: `+593987654321`)
   - `parentEmail` (value: `maria@example.com`)
   - `homeAddress` (value: `Calle 10, Quito`)
4. Initialize and save

### API Call 5: Get GPS Location (Real-time Tracking)

1. Click **Add another call**
2. Configure:
   - **Name**: `GetTripLocation`
   - **Use as**: Data
   - **Method**: GET
   - **URL**: `https://api.altaviapp.com/api/v1/trips/<tripId>/location`
3. Click **Add parameter**:
   - **Key**: `tripId`
   - **Value**: `trip_12345` (example)
   - **Private**: unchecked
   - **Use in path**: ✅ **Check this box**
4. Initialize and save

### API Call 6: Get Routes

1. Click **Add another call**
2. Configure:
   - **Name**: `GetRoutes`
   - **Use as**: Data
   - **Method**: GET
   - **URL**: `https://api.altaviapp.com/api/v1/routes`
3. Initialize and save

### API Call 7: Get Active Trip

1. Click **Add another call**
2. Configure:
   - **Name**: `GetActiveTrip`
   - **Use as**: Data
   - **Method**: GET
   - **URL**: `https://api.altaviapp.com/api/v1/trips/active`
3. Add parameter:
   - **Key**: `studentId`
   - **Value**: `student_123` (example)
4. Initialize and save

✅ **All API calls are configured!**

---

## Part 4: Build Your First Page (Vehicle List)

### Step 1: Create Vehicle Management Page

1. Click on **Design** tab in Bubble
2. Create a new page: **vehicles**
3. Add a **Text** element at the top:
   - Content: `Fleet Management`
   - Font: Heading (large size)

### Step 2: Add Repeating Group for Vehicles

1. Drag a **Repeating Group** element onto the page
2. Configure in the properties panel:
   - **Type of content**: `Altaviapp Backend - GetVehicles` (select from dropdown)
   - **Data source**: Click **"Get data from an external API"**
     - API: `Altaviapp Backend - GetVehicles`
     - Click **Add**
3. Inside the repeating group, add:
   - **Text** element: Content = `Current cell's licensePlate`
   - **Text** element: Content = `Current cell's brand` `Current cell's model`
   - **Text** element: Content = `Capacity: Current cell's capacity`

### Step 3: Add "New Vehicle" Button

1. Drag a **Button** element above the repeating group
2. Configure:
   - Text: `+ Add Vehicle`
   - Style: Primary button
3. Click on the button, then click **"Start/Edit workflow"**

### Step 4: Create Vehicle Creation Workflow

1. In the workflow editor, click **Click here to add an action**
2. Select **Plugins** → **Altaviapp Backend - CreateVehicle**
3. Configure each parameter using input fields:
   - `licensePlate`: Insert dynamic data from Input field (you'll need to add input fields)
   - `brand`: Insert from input
   - `model`: Insert from input
   - etc.
4. Add another action after API call:
   - **Navigation** → **Navigate to page**: `vehicles` (refresh page)

### Step 5: Create Input Form

1. Add a **Popup** element to your page
2. Inside popup, add **Input** fields:
   - Input for `License Plate` (placeholder: "ABC-123")
   - Input for `Brand` (placeholder: "Toyota")
   - Input for `Model` (placeholder: "Hiace")
   - Input for `Year` (type: number, placeholder: "2023")
   - Input for `Capacity` (type: number, placeholder: "15")
   - Input for `Color` (placeholder: "Blanco")
3. Add a **Button** inside popup:
   - Text: `Save Vehicle`
4. Update the button workflow from Step 4 to use these inputs
5. Update the "+ Add Vehicle" button to show this popup:
   - Workflow: **Element Actions** → **Show** → select the popup

✅ **Your first page is complete!** Test it by clicking "Run" in Bubble.

---

## Part 5: Create Parent Tracking Page

### Step 1: Create Tracking Page

1. Create a new page: **tracking**
2. Add page title: `Track Your Student`

### Step 2: Add Map Element

1. Search for **Map** element in visual elements
2. Drag onto the page
3. Configure:
   - **Center**: Use dynamic data → `GetTripLocation's latitude/longitude`
   - **Zoom level**: `14`

### Step 3: Add Marker for Vehicle

1. Inside the map element, add a **Marker**
2. Configure:
   - **Address**: Use `GetTripLocation's latitude, GetTripLocation's longitude`
   - **Icon**: Upload a bus icon (🚌) or use default

### Step 4: Add Auto-Refresh

1. Add a **Refresh** workflow
2. Configure:
   - **Trigger**: Every 15 seconds
   - **Action**: Refresh **GetTripLocation** API call
3. This will auto-update the map with latest GPS position

### Step 5: Add Student Info Panel

1. Add a **Group** element next to the map
2. Inside, add text elements:
   - **Text**: `Student: [Student name]`
   - **Text**: `Vehicle: [Vehicle plate]`
   - **Text**: `Status: [Trip status]`
   - **Text**: `ETA: [Estimated arrival]`

✅ **Real-time tracking page is complete!**

---

## Part 6: Common Workflows

### Workflow 1: Create Vehicle

**Trigger**: When "Add Vehicle" button is clicked

**Steps**:
1. Make API call: `CreateVehicle`
   - licensePlate: `Input_PlateNumber's value`
   - brand: `Input_Brand's value`
   - model: `Input_Model's value`
   - year: `Input_Year's value`
   - capacity: `Input_Capacity's value`
   - color: `Input_Color's value`
2. **Only when result is success**:
   - Show alert: "Vehicle created successfully"
   - Reset all inputs
   - Hide popup
   - Navigate to: Vehicles page
3. **Only when result is error**:
   - Show alert: Result's error message

### Workflow 2: Display Real-time Location

**Trigger**: Page is loaded (tracking page)

**Steps**:
1. Get trip data: API call `GetActiveTrip`
   - studentId: Get from URL parameter
2. Display on map:
   - Center: Result's latest GPS latitude/longitude
   - Marker: Driver location
3. Schedule recurring action:
   - Every 15 seconds
   - Repeat API call `GetTripLocation`
   - Update map center

### Workflow 3: Filter Students by Grade

**Trigger**: Dropdown "Grade" value is changed

**Steps**:
1. Update Repeating Group data source:
   - Do a search for Students
   - Constraint: Grade = Dropdown's value
2. Repeating Group refreshes automatically

---

## Part 7: Testing Your Setup

### Test Checklist

- [ ] Login page works with Clerk
- [ ] Can see list of vehicles (from API)
- [ ] Can create new vehicle (form submits successfully)
- [ ] Can see list of students
- [ ] Can create new student
- [ ] Tracking page shows map
- [ ] Map updates every 15 seconds with new location
- [ ] All data is filtered by your school (institution)

### Common Issues

**Issue**: API calls return "Unauthorized"
**Solution**: Check that Clerk is properly configured and you're signed in

**Issue**: No data appears in repeating group
**Solution**: Make sure you clicked "Initialize call" for the API and it returned sample data

**Issue**: Map doesn't show vehicle location
**Solution**: Check that `GetTripLocation` API call is working and returning latitude/longitude

**Issue**: Data from other schools appears
**Solution**: Contact developer to verify institution filtering is enabled

---

## Part 8: Next Steps

Once you've completed the basic setup, you can:

1. **Customize styling**:
   - Change colors to match your brand
   - Add your school logo
   - Adjust fonts and spacing

2. **Add more pages**:
   - Routes management
   - Driver management
   - Reports and analytics
   - Incident reports

3. **Create workflows for**:
   - Editing existing records
   - Deleting records (with confirmation)
   - Filtering and searching
   - Exporting data to Excel

4. **Set up notifications**:
   - Email alerts when student is picked up
   - Push notifications for delays
   - WhatsApp integration (handled by backend)

---

## Getting Help

**If you get stuck:**
1. Check Bubble's built-in tutorials (Help → Tutorial)
2. Review this guide from the beginning
3. Contact your Altaviapp developer
4. Join Bubble forum: forum.bubble.io

**Developer Resources:**
- API Endpoint Documentation: [docs/api/API_ENDPOINTS.md](../api/API_ENDPOINTS.md)
- Workflow Templates: [docs/bubble/WORKFLOW_TEMPLATES.md](WORKFLOW_TEMPLATES.md)

---

## Quick Reference

### Essential Bubble Concepts

**Repeating Group**: Shows a list of items (like vehicles, students, routes)

**Workflow**: A series of actions that happen when something is triggered (like a button click)

**Dynamic Data**: Data that comes from your database/API and updates automatically

**Data Source**: Where your repeating group or element gets its data from

**Current cell**: In a repeating group, refers to the current item being displayed

**Input**: A field where users type information

**Popup**: A window that appears on top of your page

### API Call Types

**GET**: Retrieve data (like getting list of vehicles)

**POST**: Create new data (like creating a new student)

**PUT**: Update existing data (like changing vehicle info)

**DELETE**: Remove data (like deleting a route)

---

**Congratulations! You've set up Bubble.io for Altaviapp!** 🎉

You can now build and customize your admin dashboard and parent portal without writing any code.

**Remember**: Save your work frequently in Bubble (it usually auto-saves, but check!)

For advanced features and code examples, see [WORKFLOW_TEMPLATES.md](WORKFLOW_TEMPLATES.md).
