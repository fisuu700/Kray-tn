export interface User {
    id: number;
    fullName: string;
    email: string;
    socialId?: string;
    avatar?: string;
    isVerified: boolean;
}
