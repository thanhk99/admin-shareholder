import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { adminInfo } from "@/app/types/admin";
import AdminService from "../api/admin";
import AuthService from "../api/auth";
import { tokenManager } from "@/utils/tokenManager";

interface AuthContextType {
    admin: adminInfo | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    onLoginSuccess: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState<adminInfo | null>(null);

    const fetchAdmin = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getBaseInfo();
            if (response && response.data) {
                setAdmin(response.data);
            } else {
                setAdmin(response); // Handle flat response direct data
            }
        } catch (error) {
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }

    const handleLoginSuccess = () => {
        fetchAdmin();
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Try to refresh token on app load to restore session from HttpOnly cookie
                const response: any = await AuthService.refreshToken();
                if (response && response.accessToken) {
                    tokenManager.setAccessToken(response.accessToken);
                    await fetchAdmin();
                }
            } catch (error) {
                console.log('No active session found');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);
    const value = {
        admin,
        loading,
        refreshUser: fetchAdmin,
        onLoginSuccess: handleLoginSuccess
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};