// Toast notifications (transient UI feedback). Server notifications live in notificationService.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from '../components/common/Toast';
const Ctx = createContext(null);
let nextId = 1;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = nextId++;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);
  const api = useMemo(() => ({
    success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m),
  }), [push]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
