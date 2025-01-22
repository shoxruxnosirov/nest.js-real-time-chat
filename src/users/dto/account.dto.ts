export class CreateAccountDto {
    googleId: string;
    name: string;
    lastName?: string;
    readonly email: string;
    picture?: string;

    username?: string;
    password?: string;
    color?: string;
    
    accessToken?: string;
    refreshToken?: string;
    jwtToken?: string;

};