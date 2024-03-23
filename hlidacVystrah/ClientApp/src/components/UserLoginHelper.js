import axios from "axios";

class UserLoginHelper {

    TokenLogin = async (token = null) => {

        let defaultLoginResponse = { loggedIn: false, userEmail: null, loginToken: "", isActive: false };
        if(token == null)
            token = localStorage.getItem("loginToken");

        if (!token)
            return defaultLoginResponse;

        try {
            const response = await axios.post("/api/user/tokenlogin", {
                LoginToken: token
            });

            let data = response.data;

            if (data.responseCode === 200)
                return { loggedIn: true, userEmail: data.email, loginToken: token, isActive: data.isActive }

            return defaultLoginResponse;

        } catch (error) {
            return defaultLoginResponse;
        }
    };

    AdminTokenLogin = async (token = null) => {

        if (token == null)
            token = localStorage.getItem("loginToken");

        if (!token)
            return false;

        try {
            const response = await axios.post("/api/adm/tokenlogin", {
                LoginToken: token
            });

            let data = response.data;

            return data.responseCode === 200;

        } catch (error) {
            return false;
        }
    }
}

export default UserLoginHelper;