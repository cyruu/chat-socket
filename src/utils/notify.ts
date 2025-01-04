import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const notify = (errmsg: string, statusCode: number | undefined) =>
  toast(errmsg, {
    position: "top-center",
    autoClose: 850,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    type: statusCode == 200 ? "success" : "error",
    // type: "default",
    theme: "colored",
  });
