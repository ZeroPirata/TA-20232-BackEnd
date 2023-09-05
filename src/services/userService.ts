class UserService{

    public async getAllUser(){
        return [{name: 'user1'},{name: 'user2'},{name: 'user3'}];
    }

}

export default new UserService();