Core Functionalities:
1. Authentication & Authorization
Implement Sign-Up and Sign-In for both Doctor and Patient. 
Use JWT-based authentication for session persistence.
Implement Role-based access control (RBAC) to differentiate doctor and patient access levels.
2. Doctor Features (Front,APIs, React.js / Next.js )
Profile Management: (Step management )
Step 1 : Upload documents (e.g., medical certifications, licenses, etc.).
Step 2 : Add appointment charges for different durations (15 min, 30 min, 45 min, 60 min).
Step 3 : Define available time slots (Monday to Sunday).
Step 4 : Add multiple qualifications.
Step 5 : Add unavailable dates (e.g., vacations, personal leaves).
Step 6 : Add experience details.
Appointment Management:
View a list of appointments with filters (Upcoming, Ongoing, Cancelled, Completed).
Rescheduled appointment (If an appointment is within 60 minutes of starting, it cannot be rescheduled)
Accept, Reject, or Cancel an appointment.
View appointment details.
3. Patient Features (APIs)
Doctor Profile Viewing:
Doctor listing with filter and searching.(filter:available days and date )
Fetch and view doctor profiles with their details.
Appointment Management:
Two appointments for the same doctor should not be booked at the same time and between start time and end time.
Get available appointment slots for a doctor.
Rescheduled appointment (If an appointment is within 60 minutes of starting, it cannot be rescheduled)
Book an appointment.
View appointment details.
Cancel an appointment.
View a list of appointments with filters (Upcoming, Ongoing, Cancelled, Completed).


4. Automatic Appointment Handling
If a doctor takes no action on an appointment request within a defined time of 20 min, it should be automatically cancelled.
      5. Socket And Wallet Handling
When a patient signs up, a default balance should be added to their wallet
When a patient books an appointment, the charge should be deducted from their wallet based on the time slot and added to the doctor’s frozen wallet. Once the appointment is completed, the money should be transferred to the doctor’s main wallet.
When a doctor cancels an appointment, the patient will receive a 100% refund. But when a patient cancels, a time-based cancellation charge will apply and that charge will be added to the doctor’s wallet. (Doctor cancels → 100% refund,Patient cancels → under 3 hours → 100% refund,under 2 hours → 50% refund,under 1 hour → 20% refund,under 30 minutes → no refund).
When a patient books an appointment, the doctor should receive a notification. Also, when either the doctor or the patient changes the appointment status, a notification should be sent directly through a socket.
	
Notes :

1) validation required 
2) Implement role-based JWT-based authentication.

4) Patient side display list of doctors whose completed all step 


	


