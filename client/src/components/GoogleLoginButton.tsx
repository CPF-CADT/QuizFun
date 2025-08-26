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
                theme: "outline",  // "outline" | "filled_blue" | "filled_black"
                  size: "large",         // "small" | "medium" | "large"
                  text: "contiue_with",   // "signin_with" | "signup_with" | "continue_with" | "signup"
                  shape: "square",         // "rectangular" | "pill" | "circle" | "square"
                  width: 380,
              }
            );
          } 
        }, []);

        // This div will be replaced by the Google button
        return(
            <div className="w-full flex justify-center">
            <div
            id="googleSignInDiv"
            className="rounded-2xl shadow-md overflow-hidden"
            style={{
            background: "white",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            }}
            />
      </div>
      
      );
      };

      export default GoogleLoginButton;
