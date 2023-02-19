require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const headers = require('./middleware/headers');

// const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const path = require('path');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(headers);
app.use(express.urlencoded({ extended: false }));

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

  try{
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
  } catch (e) {
    res.status(500).send(e);
  }

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
  } catch (e) {
    res.status(500).send(e);
  }
})

// CREATE LEAGUE
app.post('/user/:id/create-league', validateSession, async (req, res) => {
  const { id } = req.params;
  const { league_name, league_type, league_size, draft_type } = req.body.league;

  try {
    const findUser = await prisma.user.findUnique({
      where: { id: String(id) }
    })
  
    const newLeague = await prisma.league.create({
      data: {
        league_name,
        league_owner: findUser.id,
        league_type,
        league_size,
        draft_type
      }
    })

    await prisma.userLeagues.create({
      data: {
        username: findUser.username,
        leagueId: newLeague.id
      }
    })

    const genTeam = await prisma.team.create({
      data: {
        userId: id,
        leagueId: newLeague.id,
        team_name: `Team ${findUser.username}`
      }
    })

    res.status(201).send(newLeague);
  } catch (e) {
    res.status(500).send(e);
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
  } catch (e) {
    res.status(500).send(e);
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
  } catch (e) {
    res.status(500).send(e);
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
  } catch (e) {
    res.status(500).send(e);
  }
})

// INVITE USER TO LEAGUE
app.post('/i/:leagueid', validateSession, async (req, res) => {
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

// FETCH TEAM
app.get('/user/:uid/league/:lid/team', validateSession, async (req, res) => {
  const { uid, lid } = req.params;

  try {
    const userTeam = await prisma.team.findUnique({
      where: {
        userId_leagueId: { userId: uid, leagueId: lid }
      }
    })

    res.status(200).send(userTeam);
  } catch (e) {
    res.status(500).send(e);
  }
})

// FETCH USER TEAM
app.get('/user/:uid/league/:lid/team', validateSession, async (req, res) => {
  const { uid, lid } =  req.params;
  
  try {
    const team = await prisma.team.findUnique({
      where: {
        userId_leagueId: { userId: uid, leagueId: lid }
      }
    })

    res.status(200).send(team);
  } catch (e) {
    res.status(500).send(e);
  }
})

// ADD PLAYER TO ROSTER
app.post("/roster/:uid/:lid/add", validateSession, async (req, res) => {
  const { uid, lid } = req.params;

    try {

      const assignPlayer = await prisma.team.update({
        where: {
          userId_leagueId: { userId: uid, leagueId: lid }
        },
        data: {
          bench: {
            push: leaguePlayer
          }
        }
      })
      
      res.status(200).send(assignPlayer);

    } catch (e) {
      res.status(500).send(e);
    }
})

const server = app.listen(process.env.PORT, () => 
  console.log(`
    🚀 Server ready at: ${process.env.PORT}
    ⭐️ See sample requests: http://pris.ly/e/js/rest-express#3-using-the-rest-api
  `)
)