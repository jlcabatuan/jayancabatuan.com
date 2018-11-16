var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: {type: String, required: true, trim: true},
    password: {type: String, required: true},
    lastname: {type: String, required: true, trim: true},
    firstname: {type: String, required: true, trim: true},
    displayname: {type: String, trim: true},
    photo: {type: String, trim: true},
    insertdate: {type: Date, default: Date.now, required: true},
    updatedate: {type: Date},
}, { collection: 'users' });

var PicSchema = new Schema({
    file: Schema.Types.Mixed,
    meta: Schema.Types.Mixed,
    insertdate: {type: Date, default: Date.now, required: true}
}, { collection: 'photos', _id: true });

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

PicSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

PicSchema.set('toObject', {
    getters: true,
    virtuals: true
});

PicSchema.virtual('ShutterSpeed').get(function () {
  if(this.meta.exif.ExposureTime)
    return Math.round(1/this.meta.exif.ExposureTime);
});

PicSchema.virtual('PhotoTitle').get(function() {
  return this.file.originalname.slice(0, -4)
})

module.exports = {
    User: mongoose.model('User', UserSchema),
    Pic: mongoose.model('Pic', PicSchema)
};
