import React, { createContext, useContext, useEffect, useState } from "react";

export const authContext = createContext();

export const useAuth = () => {
  return useContext(authContext);
};

export function useProvideAuth() {
  const [token, setToken] = useState(localStorage.getItem('userToken'));
  useEffect(() => {
    if (token != null) {
      localStorage.setItem('userToken', token);
    } else {
      localStorage.removeItem('userToken');
    }
  })
  function logout() {
    setToken(null);
    localStorage.removeItem('userToken');
  }
  return {
    token,
    setToken,
    logout,
  };
}
