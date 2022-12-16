require('dotenv').config()
const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

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

app.post('/create-call', async(req, res) => {
    
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
      year,
      
      ocupation,
      price,
      exclint,
      onesocialnetwork,
      twosocialnetwork,
      indication,
      indicationName,
      local,
      desc,
      attendance
  } = req.body

  // env
  const token = process.env.TOKEN
  const clientId = process.env.CLIENT_ID
  const apiKey = process.env.API_KEY

  const description = `
    EMPRESA: ${company};
    CONTATO: ${phoneNumber};
    EMAIL: ${email};
    OCUPAÇÂO: ${ocupation};
    VALOR COBRADO: R$ ${(price.toFixed(2)).toString().replace('.',',')};
    È UM EX-CLIENTE: ${exclint ? 'Sim' : 'Não'};
    SEGUE UMA REDE SOCIAL: ${onesocialnetwork ? 'Sim' : 'Não'};
    SEGUE MAIS DE UMA REDE SOCIAL: ${twosocialnetwork ? 'Sim' : 'Não'};
    FOI INDICADO: ${indication ? 'Sim' : 'Não'} - ${indicationName};
    UNIDADE DE ATENDIMENTO: ${local};
    DESCRIÇÃO: ${desc};
    ATENDIMENTO: ${attendance};
  `
  
    const numDate1End = Number(hours) + 1

        let date1 = `${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":30";
        let date2 = `${year}-${month}-${day}` + "T" + `${numDate1End < 10 ? '0' : ''}${numDate1End}` + `:${minutes}` + ":30";


        let x = new Date(`${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":00");
        let y = new Date(`${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":00");

        const hoursStart = x.getUTCHours()
        const hoursEnd = y.getUTCHours() + 1

        const addZeroStart = hoursStart < 10 ? '0' : ''
        const addZeroEnd = hoursEnd < 10 ? '0' : ''

        let end1 = `${year}-${month}-${day}` + "T" + `${addZeroStart}${hoursStart}` + ":" + `${(x.getMinutes())}${(x.getMinutes()) < 10 ?'0':''}` + ":00" + ".000Z";
        let end2 = `${year}-${month}-${day}` + "T" + `${addZeroEnd}${hoursEnd}` + ":" + `${(y.getMinutes())}${(y.getMinutes()) < 10 ?'0':''}` + ":00" + ".000Z";

  
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
            maxResults: 1,
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: 'America/Sao_Paulo'
        });

        let events = result.data.items;

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
      
        try {
          
          let link = await calendar.events.insert({
            calendarId: 'primary', 
            conferenceDataVersion: '1', 
            resource: event 
          })
  
         // console.log(link)
          
          //link.data.hangoutLink
          return res.status(200).json({
            msg: link.data.hangoutLink
          })

        } catch (error) {
          return res.status(500).json(error)
        }

})

app.post('/create-presential', async(req, res) => {
    
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
      year,
      ocupation,
      price,
      exclint,
      onesocialnetwork,
      twosocialnetwork,
      indication,
      indicationName,
      local,
      desc,
      attendance
  } = req.body

  // env
  const token = process.env.TOKEN
  const clientId = process.env.CLIENT_ID
  const apiKey = process.env.API_KEY

  const description = `
    EMPRESA: ${company};
    CONTATO: ${phoneNumber};
    EMAIL: ${email};
    OCUPAÇÂO: ${ocupation};
    VALOR COBRADO: ${(price.toFixed(2)).toString().replace('.',',')};
    È UM EX-CLIENTE: ${exclint ? 'Sim' : 'Não'};
    SEGUE UMA REDE SOCIAL: ${onesocialnetwork ? 'Sim' : 'Não'};
    SEGUE MAIS DE UMA REDE SOCIAL: ${twosocialnetwork ? 'Sim' : 'Não'};
    FOI INDICADO: ${indication ? 'Sim' : 'Não'} - ${indicationName};
    UNIDADE DE ATENDIMENTO: ${local};
    DESCRIÇÃO: ${desc};
    ATENDIMENTO: ${attendance};
  `
  
    const numDate1End = minutes == '30' ? Number(hours) + 1 : Number(hours)
    const minutesDefined = minutes == '30' ? '20' : '50'

        let date1 = `${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":30";
        let date2 = `${year}-${month}-${day}` + "T" + `${numDate1End < 10 ? '0' : ''}${numDate1End}` + `:${minutesDefined}` + ":30";


        let x = new Date(`${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":00");
        let y = new Date(`${year}-${month}-${day}` + "T" + hours + `:${minutes}` + ":00");

        const hoursStart = x.getUTCHours()
        const hoursEnd = y.getUTCHours() + 1

        const addZeroStart = hoursStart < 10 ? '0' : ''
        const addZeroEnd = hoursEnd < 10 ? '0' : ''

        let end1 = `${year}-${month}-${day}` + "T" + `${addZeroStart}${hoursStart}` + ":" + `${(x.getMinutes())}${(x.getMinutes()) < 10 ?'0':''}` + ":00" + ".000Z";
        let end2 = `${year}-${month}-${day}` + "T" + `${addZeroEnd}${hoursEnd}` + ":" + `${(y.getMinutes())}${(y.getMinutes()) < 10 ?'0':''}` + ":00" + ".000Z";

  
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
            maxResults: 1,
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: 'America/Sao_Paulo'
        });

        let events = result.data.items;

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
            start: {
                dateTime: date1,
                timeZone: 'America/Sao_Paulo',
            },
            end: {
                dateTime: date2,
                timeZone: 'America/Sao_Paulo',
            },
        }
      
        try {
          
          let link = await calendar.events.insert({
            calendarId: 'primary', 
            conferenceDataVersion: '1', 
            resource: event 
          })
  
         // console.log(link)
          
          //link.data.hangoutLink
          return res.status(200).json({
            msg: link.data.hangoutLink
          })

        } catch (error) {
          return res.status(500).json(error)
        }

})

app.post('/send', async (req, res) => {

  const {
    email,
    name,
    date,
    time,
    link,
    isPresential,
    local
  } = req.body


  let addressWithCep = ''
  let address = ''

  switch(local){
    case 'Palmeiras de Goiás - GO':
      addressWithCep = '76.190-000, Palmeiras de Goiás – GO'
      address = 'Rua Abel Coimbra, N. 333, Qd. 47, Lt. 05-B, Sala 01,Setor Central.'
    break
    case 'Goiânia - GO':
      addressWithCep = '74.150-040, Setor Marista, Goiânia – GO'
      address = 'Av. D (esq. com Rua 09), 419, Qd. G-11, Lt. 01, 4º Andar, Edifício Marista.'
    break
    case 'Rio de Janeiro - RJ':
      addressWithCep = '22290-240, Botafogo, Rio de Janeiro – RJ'
      address = 'Av. Pasteur, 110.'
    break
    case 'São Paulo - SP':
      addressWithCep = '04538-133, Itaim Bibi, São Paulo – SP'
      address = 'Av. Brigadeiro Faria Lima, 4221.'
    break
  }

  const trasporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'leadercorp.app@gmail.com',
      pass: process.env.PASS,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.API_KEY,
      refreshToken: process.env.TOKEN
    }
  })

  trasporter.use('compile', hbs({
    viewEngine: {
      extname: '.html',
      partialsDir: path.resolve('./src/view'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./src/view'),
    extName: '.handlebars'
  }))
    
    
  try {
    
    const timerSplit = time.split(':')
    const numTimer = Number(timerSplit[0])
    //console.log(numTimer)

    trasporter.sendMail({
      subject: `Olá ${name}, você agendou um horário para falar com nossa equipe!`,
      from: `Ledercorp <se8292829@gmail.com>`,
      to: [email],
      template: 'email',
      context: {
        date: date,
        time: time,
        link: link,
        timeType: `${numTimer > 12 ? 'pm' : 'am'}`,
        name,
        isPresential,
        addressWithCep,
        address
      }
    })
    return res.status(200).json('Email Send')

  } catch (error) {
    return res.status(422).json({
      msg: 'Erro',
      error
    })
  }

})

app.listen(process.env.PORT || 5000)