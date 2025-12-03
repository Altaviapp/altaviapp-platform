# Bubble.io Workflow Templates for Altaviapp

**Copy-Paste Ready Workflows**
**Version**: 1.0
**Date**: January 2025

---

## Overview

This document provides ready-to-use Bubble.io workflows for common Altaviapp operations. Each template includes:
- When to trigger the workflow
- Step-by-step actions
- Configuration settings
- Error handling

**How to use**: Copy the workflow structure and adapt field names to match your Bubble app.

---

## Table of Contents

1. [Fleet Management Workflows](#fleet-management-workflows)
2. [Student Management Workflows](#student-management-workflows)
3. [Route Management Workflows](#route-management-workflows)
4. [Real-time Tracking Workflows](#real-time-tracking-workflows)
5. [Incident Reporting Workflows](#incident-reporting-workflows)
6. [Parent Portal Workflows](#parent-portal-workflows)

---

## Fleet Management Workflows

### Workflow 1.1: Create Vehicle

**Trigger**: When Button "Add Vehicle" is clicked

**Actions**:

**Step 1**: Show popup "Create Vehicle Form"
- Element: Popup_CreateVehicle
- Effect: Slide down

**Step 2**: (Inside popup button "Save") Make API call
- API: Altaviapp Backend - CreateVehicle
- Parameters:
  - `licensePlate`: Input_PlateNumber's value
  - `brand`: Input_Brand's value
  - `model`: Input_Model's value
  - `year`: Input_Year's value (convert to number)
  - `capacity`: Input_Capacity's value (convert to number)
  - `color`: Input_Color's value

**Step 3a**: Only when **Step 2's success is true**
- Action: Show alert
  - Message: "Vehicle created successfully!"
  - Style: Success
- Action: Hide popup "Create Vehicle Form"
- Action: Reset inputs
  - Input_PlateNumber
  - Input_Brand
  - Input_Model
  - Input_Year
  - Input_Capacity
  - Input_Color
- Action: Refresh repeating group
  - Element: RepeatingGroup_Vehicles

**Step 3b**: Only when **Step 2's success is false**
- Action: Show alert
  - Message: "Error: " + Step 2's error message
  - Style: Error

---

### Workflow 1.2: Edit Vehicle

**Trigger**: When Button "Edit" (in repeating group cell) is clicked

**Actions**:

**Step 1**: Display data in popup
- Action: Show popup "Edit Vehicle Form"
- Action: Set state "CurrentVehicle" = Current cell's vehicle

**Step 2**: Populate form fields
- Input_PlateNumber's initial content: Get state "CurrentVehicle's licensePlate"
- Input_Brand's initial content: Get state "CurrentVehicle's brand"
- (repeat for all fields)

**Step 3**: Make API call (when "Save Changes" clicked)
- API: Altaviapp Backend - UpdateVehicle
- Parameters:
  - `id`: Get state "CurrentVehicle's id"
  - `licensePlate`: Input_PlateNumber's value
  - `brand`: Input_Brand's value
  - (all other fields)

**Step 4a**: Success handling
- Show alert: "Vehicle updated successfully"
- Hide popup
- Refresh RepeatingGroup_Vehicles

**Step 4b**: Error handling
- Show alert: "Error: " + API result's error message

---

### Workflow 1.3: Delete Vehicle (with confirmation)

**Trigger**: When Button "Delete" is clicked

**Actions**:

**Step 1**: Show confirmation alert
- Action: Show alert
  - Message: "Are you sure you want to delete this vehicle?"
  - Style: Warning
  - Buttons: "Yes, Delete" | "Cancel"

**Step 2**: Only when user confirms
- API: Altaviapp Backend - DeleteVehicle
- Parameters:
  - `id`: Current cell's vehicle id

**Step 3a**: Success
- Show alert: "Vehicle deleted"
- Refresh RepeatingGroup_Vehicles

**Step 3b**: Error
- Show alert: "Cannot delete vehicle: " + error message

---

### Workflow 1.4: Filter Vehicles by Status

**Trigger**: When Dropdown "Status Filter" value is changed

**Actions**:

**Step 1**: Update repeating group data source
- RepeatingGroup_Vehicles data source:
  - API call: GetVehicles
  - Add constraint: `status = Dropdown_StatusFilter's value`
  - **If dropdown value is "all"**: Remove constraint (show all)

**Notes**: Repeating group will auto-refresh when data source changes.

---

## Student Management Workflows

### Workflow 2.1: Create Student with QR Code

**Trigger**: When Button "Add Student" is clicked

**Actions**:

**Step 1**: Validate phone number format
- Condition: Input_ParentPhone's value doesn't match regex `^\+593\d{9}$`
- Action: Show alert "Phone must be in format +593XXXXXXXXX"
- **Stop workflow if validation fails**

**Step 2**: Validate email
- Condition: Input_ParentEmail's value is not valid email
- Action: Show alert "Please enter a valid email"
- **Stop workflow if validation fails**

**Step 3**: Create student
- API: Altaviapp Backend - CreateStudent
- Parameters:
  - `firstName`: Input_FirstName's value
  - `lastName`: Input_LastName's value
  - `grade`: Dropdown_Grade's value
  - `dateOfBirth`: DatePicker_DOB's value (Unix timestamp)
  - `parentName`: Input_ParentName's value
  - `parentPhone`: Input_ParentPhone's value
  - `parentEmail`: Input_ParentEmail's value
  - `homeAddress`: Input_HomeAddress's value

**Step 4a**: Success
- Show alert: "Student created! QR code generated."
- Show popup "Student QR Code"
  - Display QR code image: Step 3's qrCodeDataUrl
  - Add "Download QR" button
  - Add "Print QR" button
- Reset all inputs
- Refresh RepeatingGroup_Students

**Step 4b**: Error
- Show alert: "Error creating student: " + error message

---

### Workflow 2.2: Display Student QR Code

**Trigger**: When Button "View QR" is clicked (in student row)

**Actions**:

**Step 1**: Get student QR code
- API: GetStudentQR
- Parameters:
  - `studentId`: Current cell's student id

**Step 2**: Show QR in popup
- Action: Show popup "Student QR Display"
- Image element source: Step 1's qrCodeDataUrl
- Text: "Student: " + Current cell's firstName + " " + Current cell's lastName
- Text: "Grade: " + Current cell's grade

**Step 3**: Add print button
- Button "Print QR"
- Action: Print element (Image from Step 2)

---

### Workflow 2.3: Assign Student to Route

**Trigger**: When Button "Assign to Route" is clicked

**Actions**:

**Step 1**: Show assignment popup
- Popup with:
  - Dropdown "Select Route" (data source: GetRoutes)
  - Dropdown "Select Pickup Stop" (data source: GetRouteStops filtered by selected route)
  - Input "Special Instructions" (optional)

**Step 2**: Make assignment
- API: CreateStudentRoute
- Parameters:
  - `studentId`: Current cell's student id
  - `routeId`: Dropdown_Route's value (route id)
  - `pickupStopId`: Dropdown_PickupStop's value (stop id)
  - `pickupInstructions`: Input_Instructions's value

**Step 3a**: Success
- Show alert: "Student assigned to route"
- Hide popup
- Refresh student details

**Step 3b**: Error
- Show alert: "Assignment failed: " + error message

---

## Route Management Workflows

### Workflow 3.1: Create Route with Stops

**Trigger**: When Button "Create Route" is clicked

**Actions**:

**Step 1**: Create route
- API: CreateRoute
- Parameters:
  - `name`: Input_RouteName's value
  - `type`: Dropdown_RouteType's value ("pickup" or "dropoff")
  - `vehicleId`: Dropdown_Vehicle's value
  - `driverId`: Dropdown_Driver's value
  - `scheduledStartTime`: TimePicker_StartTime's value
  - `scheduledEndTime`: TimePicker_EndTime's value

**Step 2**: Only when Step 1 succeeds
- Save route ID to state: "NewRouteId" = Step 1's result id
- Show alert: "Route created! Now add stops."
- Navigate to page: "route-stops"
  - Send parameter: routeId = Get state "NewRouteId"

---

### Workflow 3.2: Add Stop to Route

**Trigger**: When Button "Add Stop" is clicked (on map)

**Actions**:

**Step 1**: Get coordinates from map click
- Save to state: "StopLatitude" = Map's clicked latitude
- Save to state: "StopLongitude" = Map's clicked longitude

**Step 2**: Show stop details popup
- Inputs:
  - Stop name
  - Address
  - Landmark (optional)
  - Scheduled time
  - Geofence radius (default: 100 meters)

**Step 3**: Create stop
- API: CreateRouteStop
- Parameters:
  - `routeId`: URL parameter routeId
  - `name`: Input_StopName's value
  - `address`: Input_Address's value
  - `latitude`: Get state "StopLatitude"
  - `longitude`: Get state "StopLongitude"
  - `scheduledTime`: TimePicker_Time's value
  - `geofenceRadius`: Input_Radius's value (default 100)
  - `order`: RepeatingGroup_Stops's count + 1

**Step 4**: Success
- Add marker to map at coordinates
- Refresh stops list
- Close popup

---

### Workflow 3.3: Reorder Route Stops (Drag and Drop)

**Trigger**: When Repeating Group item is dropped (drag-and-drop)

**Actions**:

**Step 1**: Get new order
- Save to state: "NewOrder" = Dropped item's new index

**Step 2**: Update stop order
- API: UpdateRouteStop
- Parameters:
  - `stopId`: Dropped item's id
  - `order`: Get state "NewOrder"

**Step 3**: Refresh map route line
- Action: Update polyline on map with new stop order

---

## Real-time Tracking Workflows

### Workflow 4.1: Auto-Refresh GPS Location

**Trigger**: When Page (tracking) is loaded

**Initial Actions**:

**Step 1**: Get active trip
- API: GetActiveTrip
- Parameters:
  - `studentId`: URL parameter studentId OR Current User's student id

**Step 2**: Display initial location
- Map center: Step 1's current latitude, longitude
- Add vehicle marker at position

**Recurring Actions** (every 15 seconds):

**Step 3**: Schedule recurring event
- Every: 15 seconds
- API: GetTripLocation
- Parameters:
  - `tripId`: Get state "CurrentTripId"

**Step 4**: Update map
- Move marker to: Step 3's latitude, longitude
- Pan map center (smooth animation)
- Update text "Last updated": Current time

**Step 5**: Check for arrival
- Condition: Step 3's status = "completed"
- Show alert: "Trip completed! Student has arrived."
- Stop recurring event

---

### Workflow 4.2: Display ETA (Estimated Time of Arrival)

**Trigger**: When GPS location updates

**Actions**:

**Step 1**: Calculate distance to destination
- Use formula:
  ```
  distance = Calculate distance between:
    - Current location (GPS latitude/longitude)
    - Destination (Stop latitude/longitude)
  ```

**Step 2**: Estimate time
- Average speed: 30 km/h (configurable)
- ETA = distance / speed
- Convert to minutes

**Step 3**: Display ETA
- Text: "Estimated arrival in " + ETA + " minutes"
- Update every GPS refresh

---

### Workflow 4.3: Show Route Progress

**Trigger**: On GPS location update

**Actions**:

**Step 1**: Get all route stops
- API: GetRouteStops
- Filter: routeId = Current trip's route

**Step 2**: Check which stops are completed
- For each stop:
  - If stop has checkins: Mark as "completed" (green)
  - If vehicle within geofence: Mark as "current" (yellow)
  - Else: Mark as "pending" (gray)

**Step 3**: Update progress bar
- Completed stops / Total stops * 100 = Progress percentage

---

## Incident Reporting Workflows

### Workflow 5.1: Report Incident

**Trigger**: When Button "Report Incident" is clicked

**Actions**:

**Step 1**: Show incident form popup
- Dropdown "Incident Type": accident, breakdown, behavior, medical, security
- Dropdown "Severity": low, medium, high, critical
- Textarea "Description"
- Upload "Photos" (multiple)
- Checkbox "Medical attention required"
- Checkbox "Emergency services called"

**Step 2**: Submit incident
- API: CreateIncident
- Parameters:
  - `type`: Dropdown_Type's value
  - `severity`: Dropdown_Severity's value
  - `title`: Auto-generate: Dropdown_Type + " - " + Current date/time
  - `description`: Textarea_Description's value
  - `tripId`: Current trip id (if in active trip)
  - `medicalAttentionRequired`: Checkbox_Medical's is checked
  - `emergencyServicesNotified`: Checkbox_Emergency's is checked
  - `photos`: Upload_Photos's URLs

**Step 3a**: Success
- Show alert: "Incident reported. Reference #" + result's incident number
- Send notification to admin
- Hide form
- If severity = critical: Auto-call emergency contact

**Step 3b**: Error
- Show alert: "Failed to report incident. Please try again."
- Keep form open with data preserved

---

### Workflow 5.2: Emergency Alert (One-Click)

**Trigger**: When Button "EMERGENCY" is clicked (big red button)

**Actions**:

**Step 1**: Confirmation
- Show alert: "Call emergency services?"
- Buttons: "YES - EMERGENCY" | "Cancel"

**Step 2**: Only when confirmed
- API: CreateIncident (emergency)
- Auto-fill:
  - `type`: "emergency"
  - `severity`: "critical"
  - `title`: "EMERGENCY ALERT"
  - `emergencyServicesNotified`: true
  - `location`: Current GPS position

**Step 3**: Notifications
- Send SMS to emergency contact
- Send WhatsApp to parents
- Send push notification to admin
- Call emergency number (if integrated)

**Step 4**: Show confirmation
- Full-screen alert: "EMERGENCY REPORTED"
- Display: Emergency contact number
- Display: Nearest hospital address

---

## Parent Portal Workflows

### Workflow 6.1: Parent Login and View Student

**Trigger**: When Page (parent dashboard) is loaded

**Actions**:

**Step 1**: Get parent's students
- API: GetStudents
- Filter: parentPhone = Current User's phone

**Step 2**: Display students
- Repeating Group: List of students
- For each student:
  - Name
  - Grade
  - Photo
  - "Track Bus" button

**Step 3**: Auto-select first student
- Set state "SelectedStudent" = RepeatingGroup's first item

---

### Workflow 6.2: Check if Student is Currently in Transit

**Trigger**: When parent opens tracking page

**Actions**:

**Step 1**: Get today's trips for student
- API: GetActiveTrip
- Parameters:
  - `studentId`: Selected student id
  - `date`: Current date

**Step 2a**: If trip exists and status = "in_progress"
- Show: Live tracking map
- Show: "Your student is currently in transit"
- Start auto-refresh GPS

**Step 2b**: If no active trip
- Show: "No active trip today"
- Display: Next scheduled pickup time

---

### Workflow 6.3: Receive Pickup/Dropoff Notification

**Note**: This is handled by backend WhatsApp integration, but Bubble can show in-app notification.

**Trigger**: When webhook received (student checked in)

**Actions**:

**Step 1**: Show notification banner
- Message: "Juan has been picked up at 7:15 AM"
- Icon: Green checkmark
- Auto-hide after 10 seconds

**Step 2**: Update student status badge
- Badge text: "In Transit"
- Color: Yellow

**Step 3**: Enable "Track Live" button

---

## Advanced Workflows

### Workflow 7.1: Bulk Import Students (CSV)

**Trigger**: When Button "Import CSV" is clicked

**Actions**:

**Step 1**: Show file uploader
- FileUploader: Accept .csv only

**Step 2**: Parse CSV
- Read file contents
- Split by newline
- For each row:
  - Parse: firstName, lastName, grade, parentPhone, parentEmail

**Step 3**: Create students in loop
- For each row in CSV:
  - API: CreateStudent
  - Parameters from row data
  - Delay: 500ms between calls (avoid rate limit)

**Step 4**: Show progress
- Progress bar: Current row / Total rows
- Text: "Importing... X of Y students"

**Step 5**: Summary
- Show alert: "Imported X students successfully"
- If errors: Display list of failed rows

---

### Workflow 7.2: Generate Weekly Report

**Trigger**: When Button "Generate Report" is clicked

**Actions**:

**Step 1**: Get date range
- Start date: DatePicker_Start's value
- End date: DatePicker_End's value

**Step 2**: Fetch data
- API calls in parallel:
  - GetTrips (date range)
  - GetIncidents (date range)
  - GetCheckins (date range)

**Step 3**: Calculate metrics
- Total trips: GetTrips's count
- Completed trips: Filter status = "completed"
- Average punctuality: Calculate from trip data
- Total incidents: GetIncidents's count
- Critical incidents: Filter severity = "critical"
- Total students transported: Unique students from checkins

**Step 4**: Display report
- Show in table/charts
- Add "Export PDF" button
- Add "Email Report" button

---

## Tips for Creating Workflows

### Best Practices

1. **Always validate inputs before API calls**
   - Check required fields are filled
   - Validate format (phone, email, etc.)
   - Show helpful error messages

2. **Handle both success and error cases**
   - Success: Show confirmation, refresh data, close forms
   - Error: Show error message, keep data in form, allow retry

3. **Use conditional logic**
   - Only when: For success/error handling
   - Only when: To prevent duplicate actions
   - Every X seconds: For auto-refresh

4. **Optimize performance**
   - Don't call APIs unnecessarily
   - Use caching where possible
   - Limit auto-refresh intervals (15s minimum for GPS)

5. **User experience**
   - Show loading indicators during API calls
   - Use animations for smooth transitions
   - Provide clear feedback (alerts, messages)
   - Keep users informed of progress

### Common Pitfalls to Avoid

❌ **Don't**: Call API in every cell of repeating group
✅ **Do**: Call once and display in repeating group

❌ **Don't**: Auto-refresh too frequently (< 10 seconds)
✅ **Do**: Use appropriate intervals (15s for GPS, 30s for lists)

❌ **Don't**: Skip error handling
✅ **Do**: Always handle success AND error cases

❌ **Don't**: Submit forms without validation
✅ **Do**: Validate all inputs before API calls

❌ **Don't**: Navigate away without saving changes
✅ **Do**: Show confirmation dialog if unsaved changes

---

## Quick Reference: Workflow Action Types

### Data Actions
- **Make API call**: Call external API (Altaviapp backend)
- **Create/Modify/Delete thing**: Database operations (if using Bubble DB)
- **Do a search for**: Query database
- **Display data**: Show data in element

### Navigation Actions
- **Navigate to page**: Go to different page
- **Show popup**: Display popup
- **Hide popup**: Close popup
- **Scroll to element**: Scroll page to element

### Element Actions
- **Set state**: Save temporary data
- **Reset inputs**: Clear form fields
- **Show/Hide element**: Toggle visibility
- **Animate element**: Add animation effects

### Conditional Actions
- **Only when**: Conditional execution
- **Stop workflow**: Halt workflow execution

### Scheduled Actions
- **Schedule a custom event**: Run later
- **Cancel scheduled event**: Stop scheduled event
- **Pause workflow**: Wait X seconds

---

**Need more examples?** See [BUBBLE_SETUP_GUIDE.md](BUBBLE_SETUP_GUIDE.md) for step-by-step instructions.

**API Reference**: See [docs/api/API_ENDPOINTS.md](../api/API_ENDPOINTS.md) for all available endpoints.

---

**You now have templates for all major Altaviapp workflows!** 🎉

Copy these workflows into your Bubble app and customize them to match your specific needs. Remember to test each workflow thoroughly before going live.
