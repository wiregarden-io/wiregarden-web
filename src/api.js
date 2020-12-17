import { useEffect, useState } from "react";

import { useAuth } from "./auth.js";

export function useApi(method, url, asJson, body) {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  async function fetchApi() {
    try {
      setLoading(true);
      let resp = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        method,
        body,
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.data || ''}`);
      }
      if (asJson) {
        let respJson = await resp.json();
        setResponse(respJson);
      } else {
        let respText = await resp.text();
        setResponse(respText);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApi();
  }, []);

  return {response, error, loading};
}
