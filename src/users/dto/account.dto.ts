export class CreateAccountDto {
    readonly name: string;
    readonly email: string;
    password: string;
};
export class CreateSeanDto {
    readonly email: string;
    password: string;
}