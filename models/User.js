
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String },
    created_at: { type: Date, default: Date.now },
    local: {
        username: { type: String },
        password: { type: String },
    },
    google: {
        google_id: {type: Number}
    },
    facebook: {
        facebook_id: { type: Number }
    }
});

userSchema.statics.getOrCreateUser = async function(authType, profile) {
    const email = (authType === 'facebook') ? profile._json.email : profile._json.emails[0].value;
    return this.findOne( { email: email } )
        .then(async user => {
            if(user) {
                console.log('USER ALREADY PRESENT IN DATABASE'); 
                if(authType === 'facebook' && user.facebook.facebook_id === profile.id) {
                    return user;
                } else if(authType === 'google' && user.google.google_id === profile.id) {
                    return user;
                } else {
                    const queryToUpdate = getUpdateQueryObject(authType, profile);
                    return await this.findOneAndUpdate({ email: email }, queryToUpdate).exec();
                }
            } else {
                console.log('USER NOT PRESENT IN DATABASE, CREATING NEW USER');
                const queryToCreate = getCreateQueryObject(authType, profile);
                return await this.create(queryToCreate);
            }
        })
        .catch(err => {
            console.error('USER NOT FOUND: ', err);
            return false;
        });
}

function getCreateQueryObject(authType, profile) {
    if(authType === 'facebook') {
        return {
            firstname: profile._json.first_name,
            lastname: profile._json.last_name,
            email: profile._json.email,
            facebook: {
                facebook_id: profile.id
            }
        }
    } else {
        return {
            firstname: profile._json.name.givenName,
            lastname: profile._json.name.familyName,
            email: profile._json.emails[0].value,
            google: {
                google_id: profile.id
            }
        }
    }
}

function getUpdateQueryObject(authType, profile) {
    if(authType === 'facebook') {
        return {
            firstname: profile._json.first_name,
            lastname: profile._json.last_name,
            facebook: {
                facebook_id: profile.id
            }
        }
    } else {
        return {
            firstname: profile._json.name.givenName,
            lastname: profile._json.name.familyName,
            google: {
                google_id: profile.id
            }
        }
    }
}

// function getFindQueryObject(authType, profileId) {
//     if(authType === 'facebook') {
//         return { 'facebook.facebook_id': +profileId }; 
//     } else {
//         return { 'google.google_id': +profileId }; 
//     }
// }

module.exports = mongoose.model('User', userSchema);