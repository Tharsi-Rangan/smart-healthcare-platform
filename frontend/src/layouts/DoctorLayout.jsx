import { Outlet } from "react-router-dom";

function DoctorLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default DoctorLayout;