# Task: Rent Payment System Implementation

## Plan

- [x] Step 1: Database & Types Setup
  - [x] Create rent_payments table
  - [x] Add rent fields to rooms and tenants tables
  - [x] Update TypeScript types
  - [x] Fix TypeScript errors in existing code (minor type issues remain)

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

- [ ] Step 5: Enhanced Tenant Form (Next)
  - [ ] Add move-in date field
  - [ ] Add monthly rent field
  - [ ] Add rent due day field
  - [ ] Add deposit fields
  - [ ] Auto-generate first rent payment on tenant creation

- [ ] Step 6: Payment Analytics Charts (Next)
  - [ ] Payment timeline chart (line/bar chart)
  - [ ] Payment status distribution (pie chart)
  - [ ] Monthly revenue chart

- [ ] Step 7: WhatsApp Integration (Next)
  - [ ] Auto-send payment reminders
  - [ ] Payment due notifications
  - [ ] Payment received confirmation

- [ ] Step 8: Automatic Payment Generation (Next)
  - [ ] Create Edge Function for monthly payment generation
  - [ ] Schedule monthly payment creation
  - [ ] Update payment status (pending → overdue)

- [ ] Step 9: Testing & Validation
  - [ ] Test tenant creation with rent
  - [ ] Test payment marking
  - [ ] Test WhatsApp notifications
  - [ ] Test analytics charts
  - [ ] Run lint checks and fix remaining type errors

## Notes

- Rent payment starts from move-in date
- Monthly cycle based on rent_due_day (1-31)
- Automatic status update: pending → overdue after due date
- WhatsApp reminders sent 3 days before due date
- Payment analytics show trends and collection rates
- Core functionality implemented: database, API, UI page
- Remaining: tenant form updates, charts, WhatsApp automation, Edge Function
