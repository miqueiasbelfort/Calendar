require('dotenv').config()
const express = require('express')
const cors = require('cors')
const {google} = require('googleapis')

const app = express()

app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
  res.status(200).json({
    msg: 'Hello This is a simple API to connect with google calendar!'
  })
})
app.post('/create', (req, res) => {
    
    const {
        name,
        company,
        phoneNumber,
        email,
        location,
        startDay,
        endDay,
        startMonth,
        endMonth,
        hours
    } = req.body

    const {OAuth2} = google.auth
  
    const oAuth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.API_KEY
    )
    
    oAuth2Client.setCredentials({
        refresh_token: process.env.TOKEN
    })

    const calendar = google.calendar({version: 'v3', auth: oAuth2Client})

    let busy = false

    // Create a new event start date instance for temp uses in our calendar.
    const eventStartTime = new Date()
    eventStartTime.setDate(startDay)
    eventStartTime.setMonth(startMonth - 1)
    eventStartTime.setHours(hours + 3)
    eventStartTime.setMinutes(0)

    // Create a new event end date instance for temp uses in our calendar.
    const eventEndTime = new Date()
    eventEndTime.setDate(endDay)
    eventEndTime.setHours(hours + 4)
    eventEndTime.setMonth(endMonth - 1)
    eventEndTime.setMinutes(0)

    //const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const event = {
        summary: `NOME: ${name} - EMPRESA: ${company}`,
        location: location,
        description: `
        CONTATO: ${phoneNumber}
        EMAIL: ${email}
        `,
        colorId: 4,
        start: {
          dateTime: eventStartTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventEndTime,
          timeZone: 'America/Sao_Paulo',
        },
    }

    calendar.freebusy.query(
        {
          resource: {
            timeMin: eventStartTime,
            timeMax: eventEndTime,
            timeZone: 'America/Sao_Paulo',
            items: [{ id: 'primary' }],
          },
        },
        (err, ress) => {
          // Check for errors in our query and log them if they exist.
          if (err) return console.error('Free Busy Query Error: ', err)
  
          // Create an array of all events on our calendar during that time.
          const eventArr = ress.data.calendars.primary.busy
  
          // Check if event array is empty which means we are not busy
          if (eventArr.length === 0)
            // If we are not busy create a new calendar event.
            return calendar.events.insert(
              { calendarId: 'primary', resource: event },
              err => {
                // Check for errors and log them if they exist.
                if (err) return console.error('Error Creating Calender Event:', err)
                // Else log that the event was created.
                return
              }
            )
  
          // If event array is not empty log that we are busy.
          busy = true
          return
        }
      )

      if(busy){
        return res.status(422).json({msg: 'Horário ocupado!'})
      } 
      return res.status(200).json({msg: 'Horário agendado!'})
      
})


app.listen(process.env.PORT || 5000)