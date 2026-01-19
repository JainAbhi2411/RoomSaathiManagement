# Task: Rent Payment System Implementation

## Plan

- [x] Step 1: Database & Types Setup
  - [x] Create rent_payments table
  - [x] Add rent fields to rooms and tenants tables
  - [x] Update TypeScript types
  - [x] Fix TypeScript errors in existing code

- [x] Step 2: API Functions
  - [x] Create rent payment API functions (CRUD)
  - [x] Add function to generate monthly rent payments
  - [x] Add function to mark payment as paid
  - [x] Add function to get payment analytics
  - [x] Add getRentPayments with filters
  - [x] Add getRentPaymentById
  - [x] Add createRentPayment
  - [x] Add updateRentPayment
  - [x] Add deleteRentPayment
  - [x] Add markRentPaymentAsPaid
  - [x] Add generateMonthlyRentPayment
  - [x] Add getRentPaymentAnalytics

- [x] Step 3: Rent Payments Page
  - [x] Create RentPayments page component
  - [x] Payment status cards (pending, paid, overdue)
  - [x] Payment list/table with filters
  - [x] Mark as paid functionality
  - [x] Payment method selection
  - [x] Transaction ID input
  - [x] Notes field
  - [x] Collection rate display
  - [x] Property and status filters

- [x] Step 4: Navigation & Routes
  - [x] Add RentPayments route
  - [x] Update sidebar navigation
  - [x] Add date-fns package for date formatting

- [x] Step 5: Enhanced Rent Payments Page
  - [x] Add "Add Payment" button for manual payment entry
  - [x] Owner can select tenant and add rent details
  - [x] Add "Generate Monthly" button for automatic payment generation
  - [x] Create RentPaymentsEnhanced component with full functionality
  - [x] Manual payment creation dialog
  - [x] Automatic monthly payment generation for all tenants

- [x] Step 6: Next Payment Indicators & Revenue Tracking
  - [x] Show "Next payment due" indicator for paid payments
  - [x] Calculate next payment date based on current payment
  - [x] Display next payment date in payment list
  - [x] Add revenue overview cards (Total, Pending, Overdue)
  - [x] Update Dashboard payment links to rent-payments
  - [x] Show all payment details with revenue breakdown

- [ ] Step 7: Payment Analytics Charts (Future)
  - [ ] Payment timeline chart (line/bar chart)
  - [ ] Payment status distribution (pie chart)
  - [ ] Monthly revenue chart

- [ ] Step 8: WhatsApp Integration (Future)
  - [ ] Auto-send payment reminders
  - [ ] Payment due notifications
  - [ ] Payment received confirmation

- [ ] Step 9: Automatic Payment Generation (Future)
  - [ ] Create Edge Function for monthly payment generation
  - [ ] Schedule monthly payment creation
  - [ ] Update payment status (pending → overdue)

## Notes

- Rent payment starts from move-in date
- Monthly cycle based on rent_due_day (1-31)
- Automatic status update: pending → overdue after due date
- Owner can manually add payments for any tenant
- Owner can generate monthly payments for all tenants with one click
- Payment analytics show trends and collection rates
- **Next Payment Indicator**: Shows next due date for paid payments (current due date + 1 month)
- **Revenue Tracking**: Total revenue (all paid), Pending revenue, Overdue amount displayed
- **Dashboard Integration**: Payment links updated to point to rent-payments page
- Core functionality COMPLETE: database, API, UI page with manual/automatic payment creation, next payment indicators, revenue tracking
