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
        let date2 = `${year}-${month}-${day}` + "T" + `${numDate1End}` + `:${minutes}` + ":30";


        let x = new Date(`${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":30");
        let y = new Date(`${year}-${month}-${day}` + "T" + hours + `:45` + ":30");


        let end1 = `${year}-${month}-${day}` + "T" + (x.getUTCHours()) + ":" + (x.getUTCMinutes()) + ":00" + ".000Z";
        let end2 = `${year}-${month}-${day}` + "T" + (y.getUTCHours()) + ":" + (y.getUTCMinutes()) + ":00" + ".000Z";



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
            timeMin: end1,
            timeMax: end2,
            timeZone: 'America/Sao_Paulo'
        });

        let events = result.data.items;
        let busy = false
        
        if(events.length){
          busy = true
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

        if(busy == false){
          let link = await calendar.events.insert({
            calendarId: 'primary', 
            conferenceDataVersion: '1', 
            resource: event 
          })
          return res.status(200).json({msg: link.data.hangoutLink})
        }

        
        return res.status(422).json({msg: 'Horário ocupado!'})
        

})


app.listen(process.env.PORT || 5000, () => console.log('Server is running!'))