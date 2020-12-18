import { useEffect, useState } from "react";

import { useAuth } from "./auth.js";

export function useApi(props) {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  async function fetchApi() {
    try {
      setLoading(true);
      let resp = await fetch(props.url, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        method: props.method,
        body: props.body,
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.data || ''}`);
      }
      if (props.asJson) {
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
  }, [props.cond]);

  return {response, error, loading};
}
