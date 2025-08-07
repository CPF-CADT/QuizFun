export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    profile_url:string,
    google_id?: string;
}
export interface VerificationCode {
  email: string;      
  code: number;           
  expires_at: Date;        
}

const UserModel: User[] = [
    {
        id: "1",
        name: "Alice Doe",
        email: "alice@example.com",
        password: "hashed_password_123",
        role: "admin",
        profile_url:"http//",
        google_id: "google-uid-001"
    },
    {
        id: "2",
        name: "Bob Smith",
        email: "bob@example.com",
        password: "hashed_password_456",
        profile_url:"http//",
        role: "user"
        // google_id is optional
    }
];

export class UserRepository {
    static async getUser(email: string): Promise<User | null> {
        const userData = UserModel.find((item) => item.email === email);
        return userData || null;
    }

    static async createUser(user: User): Promise<User> {
        UserModel.push(user); 
        return user;
    }

    static async updateData(id: string, newData: Partial<User>): Promise<User> {
        const userIndex = UserModel.findIndex(user => user.id === id);
        if (userIndex === -1) throw new Error("User not found");

        UserModel[userIndex] = { ...UserModel[userIndex], ...newData };
        return UserModel[userIndex];
    }

}

const VerificationCodeModel:VerificationCode[] = [
    {
        email: 'nak@gmail.com',      
        code: 123456,   
        expires_at: new Date('2025-08-12')
    }
]
export class TwoFaTokenRepository{
    static async getToken(email: string): Promise<VerificationCode | null> {
        VerificationCodeModel.find((token)=>{
            if(token.email===email){
                return token;
            }
        })
        return null;
    }
    
    static async addToken(email: string, code: number, expires_at: Date): Promise<void> {
        VerificationCodeModel.push({email,code,expires_at})
    }

  
    static async deteteToken(email: string): Promise<boolean> {
        const index = VerificationCodeModel.findIndex((token)=>token.email=email)
        const check= VerificationCodeModel.splice(index, 1);
        return (check)?true:false;
        
    }
}