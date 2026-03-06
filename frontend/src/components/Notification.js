import toast from 'react-hot-toast';

export function notifySuccess(message) {
  return toast.success(message, {
    duration: 4000,
    style: { background: '#10b981', color: '#fff', fontWeight: 500 },
    iconTheme: { primary: '#fff', secondary: '#10b981' },
  });
}

export function notifyError(message) {
  return toast.error(message, {
    duration: 5000,
    style: { background: '#ef4444', color: '#fff', fontWeight: 500 },
    iconTheme: { primary: '#fff', secondary: '#ef4444' },
  });
}

export function notifyInfo(message) {
  return toast(message, {
    duration: 4000,
    icon: 'ℹ️',
    style: { background: '#3b82f6', color: '#fff', fontWeight: 500 },
  });
}

export function notifyWarning(message) {
  return toast(message, {
    duration: 4000,
    icon: '⚠️',
    style: { background: '#f59e0b', color: '#fff', fontWeight: 500 },
  });
}

export function notifyLoading(message) {
  return toast.loading(message);
}

export function dismissToast(id) {
  toast.dismiss(id);
}

export { toast };

const Notification = { notifySuccess, notifyError, notifyInfo, notifyWarning };
export default Notification;
