const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// Configuración dinámica de URL según el entorno
const getCallbackURL = () => `${process.env.BACKEND_URL}/api/auth/google/callback`;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: getCallbackURL()
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Verificar que el email sea de dominio UAM
        const email = profile.emails[0].value;
        
        if (!email.endsWith('@cua.uam.mx')) {
            return done(null, false, { 
                message: 'Solo se permiten correos institucionales @cua.uam.mx',
                type: 'domain_error'
            });
        }

        // Buscar usuario existente
        let user = await User.findOne({ correo: email });
        
        if (user) {
            // Usuario existente, actualizar información de Google si es necesario
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);
        } else {
            // Crear nuevo usuario
            const newUser = new User({
                nombre: profile.displayName,
                correo: email,
                googleId: profile.id,
                imagenURL: profile.photos[0].value || '',
                // No se requiere contraseña para usuarios de Google
                contrasena: 'google-auth-user'
            });
            
            await newUser.save();
            return done(null, newUser);
        }
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport; 


