require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const headers = require('./middleware/headers');

const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(headers);

// VALIDATE SESSION
const validateSession = async (req, res, next) => {

  if(req.method === 'OPTIONS') {
      next();
  } else if ( req.headers.authorization && req.headers.authorization.includes('Bearer') ) {

    const {authorization} = req.headers;
    const payload = authorization ? jwt.verify(authorization.includes('Bearer') ? authorization.split(' ')[1] : authorization, process.env.JWT_SECRET) : undefined;

    if (payload) {
      let foundUser = await prisma.user.findUnique({
        where: {
          id: payload.id
        }
      })

      if (foundUser) {
        req.user = foundUser;
        next();
      } else {
        res.status(400).send({ message: 'Not authorized' })
      }
    } else {
      res.status(401).send({ message: 'Invalid Token' })
    }
  } else {
    res.status(403).send({ message: 'Forbidden' })
  }
}

// CREATE USER
app.post('/user/signup', async (req, res) => {
  const { username, password } = req.body.user;

  const newUser = await prisma.user.create({
    data: {
      username,
      password: bcrypt.hashSync(password, 10)
    },
  })

  res.status(201).send({
    sessionToken: jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: 60*60*24 }),
    user: newUser
  });
})

// LOGIN USER
app.post('/user/login', async (req, res) => {
  const { username, password } = req.body.user;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username
      }
    })

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid Password');
    }
    
    res.status(200).send({
      sessionToken: jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 60*60*24 }),
      user
    })  
  } catch (error) {
    console.error(error);
  }
})

// CREATE LEAGUE
app.post('/user/:id/create-league', validateSession, async (req, res) => {
  const { id } = req.params;
  const { league_name } = req.body.league;

  try {
    const findUser = await prisma.user.findUnique({
      where: { id: String(id) }
    })
  
    const newLeague = await prisma.league.create({
      data: {
        league_name,
        league_owner: findUser.id
      }
    })

    const connect = await prisma.userLeagues.create({
      data: {
        username: findUser.username,
        leagueId: newLeague.id
      }
    })
  
    res.status(201).send(newLeague);
  } catch (error) {
      console.error(error);
  }
})

// FIND ALL USER LEAGUES
app.get('/user/:id/leagues', validateSession, async (req, res) => {
  const { id } = req.params;

  try {
    findUserLeagues = await prisma.league.findMany({
      where: { league_owner: String(id) }
    })

    res.status(200).send(findUserLeagues);
  } catch (error) {
    console.error(error);
  }
})

// FIND SINGLE LEAGUE
app.get('/league/:id', validateSession, async (req, res) => {
  const { id } = req.params;

  try {
    findLeague = await prisma.league.findUnique({
      where: { id: String(id) }
    })

    res.status(200).send(findLeague);
  } catch (error) {
    console.error(error);
  }
})

// FIND LEAGUE MEMBERS
app.get('/league/:id/users', validateSession, async (req, res) => {
  const { id } = req.params;

  try {
    leagueMembers = await prisma.userLeagues.findMany({
      where: { leagueId: String(id) }
    })

    res.status(200).send(leagueMembers);
  } catch (error) {
    console.error(error);
  }
})

// INVITE USER TO LEAGUE
app.post('/invite/:leagueid', validateSession, async (req, res) => {
  const { leagueid } = req.params;

  // try {
  //   const findUserLeague = await prisma.userLeagues.findUnique({
  //     where: { 
  //       userId: Number(userid),
  //       leagueId: Number(leagueid) 
  //     }
  //   })

  //   client.messages
  //     .create({
  //       body: `You've been invited to play in a fantasy football league. Click the following link to signup for an account and join. `,
  //       to: '+13179651256',
  //       from: '+18556429592'
  //     })
  //     .then(message => console.log(message.sid));

  // } catch (error) {
  //   console.error(error);
  // }
})

// FETCH ALL PLAYERS
app.get('/players/all', validateSession, async (req, res) => {
  const players = await prisma.player.findMany();
  
  res.status(200).send(players);
})

// FETCH PLAYERS BY POSITION
app.get('/players/:position', validateSession, async (req, res) => {
  const { position } = req.params;

  try {
    const players = await prisma.player.findMany({
      where: {
        pos: String(position)
      }
    })

    res.status(200).send(players);
  } catch (error) {
    console.error(error);
  }
})

const server = app.listen(3000, () => 
  console.log(`
    🚀 Server ready at: http://localhost:3000
    ⭐️ See sample requests: http://pris.ly/e/js/rest-express#3-using-the-rest-api
  `)
)