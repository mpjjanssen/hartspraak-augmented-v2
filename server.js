/**
 * Augmented Psychotherapy — toegangsportaal
 */
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
app.set('trust proxy', 1);

const ACCESS_CODE = process.env.ACCESS_CODE || '';
if (!ACCESS_CODE) console.warn('Warning: ACCESS_CODE environment variable not set');

app.use(session({
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    if (req.path.startsWith('/en')) res.redirect('/en/login');
    else if (req.path.startsWith('/de')) res.redirect('/de/login');
    else res.redirect('/login');
}

// Login — NL, EN, DE
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/en/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'en-login.html')));
app.get('/de/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'de-login.html')));
app.post('/login', (req, res) => {
    if (req.body.accessCode === ACCESS_CODE) {
        req.session.authenticated = true;
        // Redirect to language-appropriate home based on referer
        const ref = req.get('Referer') || '';
        if (ref.includes('/en/')) res.redirect('/en');
        else if (ref.includes('/de/')) res.redirect('/de');
        else res.redirect('/');
    } else {
        const ref = req.get('Referer') || '';
        if (ref.includes('/en/')) res.redirect('/en/login?error=1');
        else if (ref.includes('/de/')) res.redirect('/de/login?error=1');
        else res.redirect('/login?error=1');
    }
});

// Hub / Landing page
app.get('/hub', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/en/hub', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'en-index.html')));
app.get('/de/hub', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'de-index.html')));

// MDMA pages (main site) — NL at root, EN at /en, DE at /de
app.get('/', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'mdma.html')));
app.get('/en', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'en-mdma.html')));
app.get('/de', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'de-mdma.html')));

// Legacy routes (redirect to new structure)
app.get('/mdma', requireAuth, (req, res) => res.redirect('/'));
app.get('/en/mdma', requireAuth, (req, res) => res.redirect('/en'));
app.get('/de/mdma', requireAuth, (req, res) => res.redirect('/de'));

// Psilocybine — NL, EN, DE
app.get('/psilocybine', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'psilocybine.html')));
app.get('/en/psilocybine', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'en-psilocybine.html')));
app.get('/de/psilocybine', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'de-psilocybine.html')));
// Legacy EN route
app.get('/en/psilocybin', requireAuth, (req, res) => res.redirect('/en/psilocybine'));

// PsiloReset — NL, EN, DE
app.get('/psiloreset', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'psiloreset.html')));
app.get('/en/psiloreset', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'en-psiloreset.html')));
app.get('/de/psiloreset', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'de-psiloreset.html')));

// De Intensive — NL, EN, DE
app.get('/intensive', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'intensive.html')));
app.get('/en/intensive', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'en-intensive.html')));
app.get('/de/intensive', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'de-intensive.html')));

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
app.listen(PORT, () => console.log('Server draait op poort ' + PORT));
