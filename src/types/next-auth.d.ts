import 'next-auth'

declare module 'next-auth'{
    interface User{
        _id?:string
        isVerified?: boolean
        isAcceptingMessages?: boolean
        username?: string
    }
    interface Session{
        user:{
            _id?:string
            isVerified?: boolean
            isAcceptingMessages?: boolean
            username?: string
        }& DefaultSession['user']
    }
}

//alternate way although the tak is same as above

declare module 'next-auth/jwt'{
    interface JWT{
        _id?:string
        isVerified?: boolean
        isAcceptingMessages?: boolean
        username?: string
    }
}