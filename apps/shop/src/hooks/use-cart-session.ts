import { useState, useEffect } from "react";

export function useCartSession() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem("shopSessionId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("shopSessionId", id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}
