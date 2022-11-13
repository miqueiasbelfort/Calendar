require('dotenv').config()
const express = require('express')
const cors = require('cors')
// const Meeting = require('google-meet-api').meet

const { google } = require('googleapis');
const { OAuth2 } = google.auth

const app = express()

app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
  res.status(200).json({
    msg: 'Hello This is a simple API to connect with google calendar!'
  })
})


app.post('/create', async(req, res) => {
    
  const {
      name,
      company,
      phoneNumber,
      email,
      location,
      day,
      month,
      hours,
      minutes,
      year
  } = req.body

  // env
  const token = process.env.TOKEN
  const clientId = process.env.CLIENT_ID
  const apiKey = process.env.API_KEY

  const description = `
    EMPRESA: ${company}
    CONTATO: ${phoneNumber}
    EMAIL: ${email}
  `
  
    const numDate1End = Number(hours) + 1

        let date1 = `${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":30";
        let date2 = `${year}-${month}-${day}` + "T" + `${numDate1End < 10 ? '0' : ''}${numDate1End}` + `:${minutes}` + ":30";


        let x = new Date(`${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":30");
        let y = new Date(`${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":30");

        const hoursStart = x.getUTCHours()
        const hoursEnd = y.getUTCHours() + 1

        const addZeroStart = hoursStart < 10 ? '0' : ''
        const addZeroEnd = hoursEnd < 10 ? '0' : ''

        let end1 = `${year}-${month}-${day}` + "T" + `${addZeroStart}${hoursStart}` + ":" + `${(x.getUTCMinutes())}${(x.getUTCMinutes()) < 10 ?'0':''}` + ":00" + ".000Z";
        let end2 = `${year}-${month}-${day}` + "T" + `${addZeroEnd}${hoursEnd}` + ":" + `${(y.getUTCMinutes())}${(y.getUTCMinutes()) < 10 ?'0':''}` + ":00" + ".000Z";

        // consloe.log(end1)
        // console.log(end2)

        const testTimerStart = new Date(end1)
        const testTimerEnd = new Date(end2)

        //setting details for teacher
        let oAuth2Client = new OAuth2(
            clientId,
            apiKey
        )

        oAuth2Client.setCredentials({
            refresh_token: token,
        });

        // Create a new calender instance.
        let calendar = google.calendar({ version: 'v3', auth: oAuth2Client })


        //checking whether teacher is budy or not
        let result = await calendar.events.list({
            calendarId: 'primary',
            timeMin: testTimerStart,
            timeMax: testTimerEnd,
            maxResults: 1,
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: 'America/Sao_Paulo'
        });

        let events = result.data.items;

        if(events.length){
          return res.status(422).json({msg: 'Horário Agendado!'})
        }

        // Create a new event start date instance for teacher in their calendar.
        const eventStartTime = new Date();
        eventStartTime.setDate(day);
        const eventEndTime = new Date();
        eventEndTime.setDate(day);
        eventEndTime.setMinutes(eventStartTime.getMinutes() + 45);

        // Create a dummy event for temp users in our calendar
        const event = {
            summary: name,
            location: location,
            description: description,
            colorId: 4,
            conferenceData: {
                createRequest: {
                    requestId: "zzz",
                    conferenceSolutionKey: {
                        type: "hangoutsMeet"
                    }
                }
            },
            start: {
                dateTime: date1,
                timeZone: 'America/Sao_Paulo',
            },
            end: {
                dateTime: date2,
                timeZone: 'America/Sao_Paulo',
            },
        }
      
        let link = await calendar.events.insert({
          calendarId: 'primary', 
          conferenceDataVersion: '1', 
          resource: event 
        })
        
        //link.data.hangoutLink
        return res.status(200).json({
          msg: link.data.hangoutLink,
          date: date1,
          dateEnd: date2,
          endStart: end1,
          endEnd: end2
        })

})


app.listen(process.env.PORT || 5000, () => console.log('Server is running!'))