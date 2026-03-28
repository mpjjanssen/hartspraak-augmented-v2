/**
 * Hartspraak — Substantie-ondersteunde Psychotherapie
 * augmented.hartspraak.com
 */
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
app.set('trust proxy', 1);

const ACCESS_CODE = process.env.ACCESS_CODE || 'hartspraak2025';

app.use(session({
    secret: process.env.SESSION_SECRET || 'hartspraak-hub-geheim-sleutel',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/logo.jpg', (req, res) => res.sendFile(path.join(__dirname, 'logo.jpg')));

function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    res.redirect('/login');
}

// Login
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.post('/login', (req, res) => {
    if (req.body.accessCode === ACCESS_CODE) {
        req.session.authenticated = true;
        res.redirect('/');
    } else {
        res.redirect('/login?error=1');
    }
});

// Hub landingspagina
app.get('/', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

// MDMA
app.get('/mdma', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'mdma.html')));

// Toekomstige routes (worden stap voor stap toegevoegd)
// app.get('/psilocybine', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'psilocybine.html')));
// app.get('/psiloreset', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'psiloreset.html')));
// app.get('/intensive', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'intensive.html')));

// Downloads
app.get('/downloads/:filename', requireAuth, (req, res) => {
    res.download(path.join(__dirname, req.params.filename));
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// Catch-all
app.get('*', requireAuth, (req, res) => res.redirect('/'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Hub draait op poort ' + PORT));
