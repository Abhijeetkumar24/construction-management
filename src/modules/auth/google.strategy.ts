
// // Google signin with login

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { AuthService } from './auth.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';

// config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private authService: AuthService,
        @InjectModel(User.name) private UserModel: Model<User>
    ) {
        super({                                                                          //  inside the constructor, the Google OAuth 2.0 strategy is configured using super()
            clientID: process.env.CLIENTID,
            clientSecret: process.env.CLIENTSECRET,
            callbackURL: 'http://localhost:3000/auth/google/callback',                    //  The URL where Google will redirect users after they've authenticated.
            scope: ['email', 'profile'],                                                  //  The permissions you're requesting from the user 
        });
    }
    

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {            //  validate method is called after a user successfully authenticates with Google
        const { name, emails } = profile;

        const userName = name.givenName + ' ' + name.familyName;
        const fullName = name.givenName + ' ' + name.familyName;
        const email = emails[0].value;

        const validatedUser = await this.authService.findOrCreateGoogleUser(userName, fullName, email);
        done(null, validatedUser);                                                            // A callback function that should be called to complete the authentication process.     
    }
}