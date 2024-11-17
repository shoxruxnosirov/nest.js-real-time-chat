export class CreateAccountDto {
    name: string;
    username?: string;
    readonly email: string;
    password: string;
};
export class CreateSeanDto {
    readonly email: string;
    password: string;
    status?: string;
    last_seen?: Date;
}