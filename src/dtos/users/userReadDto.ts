export class UserReadDto {

    constructor(_id: string, _name: string, _email: string, _role: number) {
        this.id = _id
        this.name = _name
        this.email = _email
    }

    private id: string

    private name: string

    private email: string
    
}