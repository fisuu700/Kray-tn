import { User } from './user.model';

export type PostType = 'OFFER' | 'REQUEST';
export type PostStatus = 'ACTIVE' | 'INACTIVE' | 'RESOLVED';

export interface Post {
    id: number;
    type: PostType;
    title: string;
    description: string;
    category: string;
    price?: number;
    location: string;
    status: PostStatus;
    image?: string;
    owner?: User;
}

export interface PostCreateDto {
    type: PostType;
    title: string;
    description: string;
    category: string;
    price?: number;
    location: string;
    image?: string;
}
