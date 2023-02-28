# Calendar

* This is a Node.js server using Express framework and nodemailer and Google Calendar APIs to create an event, send an email and return a link to a Google Meet meeting.
* The server listens for POST requests on /create-call and /create-presential endpoints to create meetings and send emails to the participants.

___


* The /create-call endpoint creates a Google Meet link for an online meeting and returns the link to the client. It takes in the following parameters in the request body:

* name: The name of the participant.
* company: The company name of the participant.
* phoneNumber: The phone number of the participant.
* email: The email of the participant.
* location: The location of the meeting.
* day: The day of the meeting (1-31).
* month: The month of the meeting (1-12).
* hours: The hour of the meeting (0-23).
* minutes: The minute of the meeting (0-59).
* year: The year of the meeting.
* ocupation: The occupation of the participant.
* price: The price of the meeting.
* exclint: Whether the participant is an ex-client.
* onesocialnetwork: Whether the participant follows one social network.
* twosocialnetwork: Whether the participant follows more than one social network.
* indication: Whether the participant was indicated.
* indicationName: The name of the person who indicated the participant.
* ocmIndication: Whether the participant was indicated by the company.
* ocmIndicationName: The name of the person who indicated the participant in the company.
* local: The location of the meeting.
* desc: A description of the meeting.
* attendance: The type of attendance.

____


The /create-presential endpoint creates an event for a face-to-face meeting and sends an email with the details of the event to the participants. It takes in the same parameters as /create-call, with the addition of:

address: The address of the meeting.
The server uses nodemailer to send emails to the participants. It sends a confirmation email to the participant with the details of the meeting. The email is sent using Gmail SMTP and nodemailer-express-handlebars to create an HTML template for the email.

The server uses Google Calendar API to create an event for the meeting. It uses the OAuth2 authentication method to authorize the server to access the user's Google Calendar. It then creates an event on the user's calendar with the details of the meeting, including a Google Meet link for the online meetings.
