
// Google signin with login

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { AuthService } from './auth.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private authService: AuthService,
        @InjectModel(User.name) private UserModel: Model<User>
    ) {
        super({
            clientID: process.env.CLIENTID,
            clientSecret: process.env.CLIENTSECRET,
            callbackURL: 'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }
    

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile;

        const userName = name.givenName + ' ' + name.familyName;
        const fullName = name.givenName + ' ' + name.familyName;
        const email = emails[0].value;

        const validatedUser = await this.authService.findOrCreateGoogleUser(userName, fullName, email);
        done(null, validatedUser);
    }
}