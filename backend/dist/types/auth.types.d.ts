export type Role = 'PATIENT' | 'DOCTOR' | 'INSURER' | 'ADMIN';
export interface AuthPayload {
    userId: string;
    email: string;
    role: Role;
    iat?: number;
    exp?: number;
}
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    licenseNumber?: string;
    specialtyId?: string;
    companyId?: string;
    establishmentId?: string;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: Role;
            isActive: boolean;
        };
        token: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            tokenType: string;
        };
    };
}
