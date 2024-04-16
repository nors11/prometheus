import { Schema } from 'mongoose';
import { User } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export const UserSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: false},
  name: {type: String, required: true},
  surname: {type: String, required: false},
  role: {type: String, required: true},
  status: {type: Boolean, required: false},
  id_distributor: {type: ObjectId},
  id_pharmacy: {type: ObjectId}
});

export enum UserRole {
    admin = 'admin',
    distributor = 'distributor',
    pharmacy = 'pharmacy'
}

UserSchema.pre('save', async function(next) {
    const user = this;
    if (user.password) {
      try {
        const encrypted = await bcrypt.hash(user.password, 10);
        user.password = encrypted;
        next();
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  });