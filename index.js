require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Meeting = require('google-meet-api').meet

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
  
  Meeting({
    clientId : clientId,
    clientSecret : apiKey,
    refreshToken : token,
    date : `${year}-${month}-${day}`,
    time : `${hours}:${minutes}`,
    summary : name,
    location : location,
    description : description
  }).then(result => {
    if(result !== null){
      return res.status(200).json({msg: result})
    }
    return res.status(422).json({msg: 'Horário ocupado, por favor escolha outra hora para marcar uma reunião!'})
  })

})


app.listen(process.env.PORT || 5000, () => console.log('Server is running!'))