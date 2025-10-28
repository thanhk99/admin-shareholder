'use client' ; 
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import TokenService from "../api/token";
import { onTokenRefreshed } from "../utils/axios";
import { adminInfo } from "@/app/types/admin";
import AdminService from "../api/admin";

interface AuthContextType {
  admin: adminInfo | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  onLoginSuccess: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [admin , setAdmin] = useState<adminInfo | null>(null);

    const fetchAdmin = async ()=>{
        try{
            setLoading(true);
            const isLogin = TokenService.isLogin();
            if(!isLogin){
                setAdmin(null);
                return;
            }
            const response = await AdminService.getBaseInfo();
            console.log(response)
            setAdmin(response.data);
        }catch(error){
            TokenService.clearToken();
            setAdmin(null);
        }
    }
    const handleLoginSuccess = () => {
        fetchAdmin();
    };
    useEffect(() => {
        fetchAdmin();
        
        // Lắng nghe sự kiện token được refresh để fetch lại user data
        const unsubscribe = onTokenRefreshed(() => {
        fetchAdmin();
        });
        
        return () => {
        unsubscribe();
        };
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