import React, { useEffect } from "react";
import { authApi } from "../service/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const GoogleLoginButton: React.FC = () => {
  const { socialLogin } = useAuth(); 
  const navigate = useNavigate(); 

  const handleCredentialResponse = async (response: { credential?: string }) => {
    if (!response.credential) {
      console.error("Google credential response is missing.");
      return;
    }
    
    try {
      const token = response.credential;
      console.log(token)
      const { data } = await authApi.googleAuthenication(token);
      
      socialLogin(data);

      navigate("/dashboard");

    } catch (error) {
      toast.error("Google login error: " + error);
    }
  };

  useEffect(() => {
    if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv") as HTMLElement,
        { 
          theme: "outline", 
          size: "large",
          type: 'standard',
          text: 'continue_with',
          width: '300px' 
        }
      );
    } else {
      console.error("Google Identity Services script not loaded or Client ID is missing.");
    }
  }, []);

  // This div will be replaced by the Google button
  return <div id="googleSignInDiv" className="w-full flex justify-center"></div>;
};

export default GoogleLoginButton;
